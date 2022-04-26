<template>
    <div v-click-outside="handleClickOutside" class="gnb-search">
        <g-n-b-search-input v-if="isOverLaptopSize" v-model="inputText"
                            :is-focused.sync="isFocusOnInput"
                            @click="showSuggestion"
                            @esc="hideSuggestion"
                            @arrow-up="moveFocusToSuggestion('END')"
                            @arrow-down="moveFocusToSuggestion('START')"
                            @input="handleUpdateInput"
        />

        <span v-else
              class="menu-button"
        >
            <p-i v-if="dataState.proxyVisibleSuggestion"
                 name="ic_delete--bold"
                 height="1.5rem" width="1.5rem"
                 color="inherit"
                 @click.stop="hideSuggestion"
            />
            <p-i v-else
                 name="ic_search--bold"
                 height="1.5rem" width="1.5rem"
                 color="inherit"
                 @click.stop="showSuggestion"
            />
        </span>
        <g-n-b-search-dropdown v-show="proxyVisibleSuggestion"
                               :input-text="trimmedInputText"
                               :loading="loading"
                               :menu-items="dataState.menuSuggestions"
                               :cloud-service-type-items="dataState.cloudServiceTypeSuggestions"
                               :focus-start-position="focusStartPosition"
                               :is-focused.sync="isFocusOnSuggestion"
                               :is-recent="showRecent"
                               @move-focus-end="handleMoveFocusEnd"
                               @close="hideSuggestion"
                               @select="handleSelect"
        >
            <template #search-input>
                <g-n-b-search-input v-if="!isOverLaptopSize"
                                    v-model="inputText"
                                    :is-focused.sync="isFocusOnInput"
                                    @click="showSuggestion"
                                    @esc="hideSuggestion"
                                    @arrow-up="moveFocusToSuggestion('END')"
                                    @arrow-down="moveFocusToSuggestion('START')"
                                    @input="handleUpdateInput"
                />
            </template>
        </g-n-b-search-dropdown>
    </div>
</template>

<script lang="ts">
import axios, { CancelTokenSource } from 'axios';
import { throttle } from 'lodash';
import vClickOutside from 'v-click-outside';

import {
    computed, defineComponent, onMounted, onUnmounted,
    reactive, toRefs,
} from '@vue/composition-api';

import { PI } from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { laptop } from '@spaceone/design-system/src/styles/screens';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { RECENT_TYPE, RecentItem } from '@/store/modules/recent/type';

import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchInput.vue';
import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchDropdown.vue';
import {
    FocusStartPosition, SUGGESTION_TYPE,
    SuggestionItem,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { getAllSuggestionMenuList, SuggestionMenu } from '@/lib/helper/menu-suggestion-helper';
import {
    convertCloudServiceConfigToReferenceData,
    convertMenuConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import { getTextHighlightRegex } from '@/common/components/text/text-highlighting/helper';
import { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import { MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';


interface CloudServiceTypeData {
    id: string;
    provider: string;
    group: string;
    name: string;
    icon: string;
}

const LAPTOP_WINDOW_SIZE = laptop.max;

interface Props {
    visibleSuggestion: boolean;
}

const RECENT_LIMIT = 5;

export default defineComponent<Props>({
    name: 'GNBSearch',
    components: {
        GNBSearchDropdown,
        GNBSearchInput,
        PI,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        visibleSuggestion: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisibleSuggestion: useProxyValue('visibleSuggestion', props, emit),
            isFocusOnInput: false,
            isFocusOnSuggestion: false,
            focusStartPosition: 'START',
            inputText: '',
            trimmedInputText: computed<string>(() => {
                if (state.inputText) return state.inputText.trim();
                return '';
            }),
            isOverLaptopSize: window.innerWidth > LAPTOP_WINDOW_SIZE,
            loading: true,
            showRecent: computed(() => !state.inputText.length),
        });

        const dataState = reactive({
            // menu
            allMenuList: computed<SuggestionMenu[]>(() => getAllSuggestionMenuList(store.getters['display/allGnbMenuList'])),
            filteredMenuList: [] as SuggestionMenu[],
            recentMenuItems: computed<RecentItem[]>(() => convertMenuConfigToReferenceData(
                store.state.recent.menuItems,
                store.getters['display/allGnbMenuList'],
            )),
            menuSuggestions: computed<SuggestionItem[]>(() => {
                if (state.showRecent) return dataState.recentMenuItems;
                return dataState.filteredMenuList.map(d => ({
                    name: d.id,
                    label: d.label,
                    parents: d.parents ? d.parents.map(p => ({ name: p.id, label: p.label })) : undefined,
                    icon: d.icon,
                }));
            }),
            // cloud service
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.state.reference.cloudServiceType.items),
            cloudServiceTypeList: [] as CloudServiceTypeData[],
            recentCloudServiceItems: computed<RecentItem[]>(() => convertCloudServiceConfigToReferenceData(
                store.state.recent.cloudServiceItems,
                dataState.cloudServiceTypes,
            )),
            cloudServiceTypeSuggestions: computed<SuggestionItem[]>(() => {
                if (state.showRecent) return dataState.recentCloudServiceItems;
                return dataState.cloudServiceTypeList.map(d => ({
                    itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
                    name: d.id,
                    label: d.name,
                    icon: d.icon,
                    defaultIcon: d.icon,
                    parents: [{ name: d.group, label: d.group }],
                    provider: d.provider,
                }));
            }),
        });

        const filterMenuItemsBySearchTerm = (menu: SuggestionMenu[], searchTerm?: string): SuggestionMenu[] => {
            const regex = getTextHighlightRegex(searchTerm);

            return menu.map(d => ({
                id: d.id,
                label: d.label,
                parents: d.parents ? d.parents : undefined,
            })).filter((d) => {
                if (regex.test(d.label as string)) return true;
                if (d.parents && d.parents.some(p => regex.test(p.label as string))) return true;
                return false;
            }).slice(0, 5);
        };


        /* API */
        let resourceToken: CancelTokenSource | undefined;
        const getCloudServiceResources = async (inputText) => {
            if (resourceToken) {
                resourceToken.cancel('Next request has been called.');
                resourceToken = undefined;
            }
            resourceToken = axios.CancelToken.source();

            try {
                const { results } = await SpaceConnector.client.addOns.autocomplete.resource({
                    resource_type: 'inventory.CloudServiceType',
                    search: inputText,
                    options: {
                        limit: 15,
                        targets: ['name', 'group'],
                    },
                }, {
                    cancelToken: resourceToken.token,
                });
                resourceToken = undefined;
                return results;
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }
                return [];
            }
        };

        /* Event */
        const showSuggestion = async () => {
            if (!state.isFocusOnInput) state.isFocusOnInput = true;
            if (!state.proxyVisibleSuggestion) {
                state.loading = true;
                state.proxyVisibleSuggestion = true;
                state.loading = false;
            }
        };

        const hideSuggestion = () => {
            if (state.proxyVisibleSuggestion) {
                state.proxyVisibleSuggestion = false;
                state.inputText = '';
                state.isFocusOnInput = false;
                state.isFocusOnSuggestion = false;
                dataState.cloudServiceTypeList = [];
                dataState.filteredMenuList = [];
            }
        };

        const moveFocusToSuggestion = (focusStartPosition: FocusStartPosition) => {
            if (!state.proxyVisibleSuggestion) state.proxyVisibleSuggestion = true;
            state.isFocusOnInput = false;
            state.focusStartPosition = focusStartPosition;
            state.isFocusOnSuggestion = true;
        };

        const handleMoveFocusEnd = () => {
            state.isFocusOnSuggestion = false;
            state.isFocusOnInput = true;
        };

        const handleUpdateInput = async () => {
            if (state.trimmedInputText) {
                const results = await getCloudServiceResources(state.trimmedInputText);
                dataState.cloudServiceTypeList = results.map(d => d.data);
                dataState.filteredMenuList = filterMenuItemsBySearchTerm(dataState.allMenuList, state.trimmedInputText);
            }
        };

        const handleSelect = (index: number, type: SUGGESTION_TYPE) => {
            if (type === 'MENU') {
                const menuId = state.showRecent ? dataState.recentMenuItems[index]?.itemId : dataState.filteredMenuList[index]?.id;
                if (!menuId) return;

                const menuRoute: MenuInfo = MENU_INFO_MAP[menuId];
                if (!menuRoute || SpaceRouter.router.currentRoute.name === menuRoute.to.name) return;

                try {
                    SpaceRouter.router.push(menuRoute.to);
                } catch (e) {}
            } else {
                const cloudServiceTypeId = state.showRecent ? dataState.recentCloudServiceItems[index]?.itemId : dataState.cloudServiceTypeList[index]?.id;
                if (!cloudServiceTypeId) return;

                const cloudServiceType = dataState.cloudServiceTypes[cloudServiceTypeId];
                try {
                    SpaceRouter.router.push({
                        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: cloudServiceType.data.provider,
                            group: cloudServiceType.data.group,
                            name: cloudServiceType.name,
                        },
                    });
                } catch (e) {}
            }
            hideSuggestion();
        };

        const handleClickOutside = () => {
            if (!state.isOverLaptopSize) hideSuggestion();
        };

        const onWindowResize = throttle(() => {
            state.isOverLaptopSize = window.innerWidth > LAPTOP_WINDOW_SIZE;
        }, 500);

        onMounted(() => {
            window.addEventListener('resize', onWindowResize);
        });
        onUnmounted(() => {
            window.removeEventListener('resize', onWindowResize);
        });

        (async () => {
            await Promise.allSettled([
                // store.dispatch('reference/project/load'),
                // store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('recent/load', { itemType: RECENT_TYPE.MENU, limit: RECENT_LIMIT }),
                store.dispatch('recent/load', { itemType: RECENT_TYPE.CLOUD_SERVICE, limit: RECENT_LIMIT }),
                // store.dispatch('recent/load', RECENT_TYPE.PROJECT),
                // store.dispatch('recent/load', RECENT_TYPE.PROJECT_GROUP),
            ]);
        })();

        return {
            ...toRefs(state),
            dataState,
            showSuggestion,
            hideSuggestion,
            moveFocusToSuggestion,
            handleMoveFocusEnd,
            handleUpdateInput,
            handleSelect,
            handleClickOutside,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search {
    @apply relative;

    .menu-button {
        @apply text-gray-500;
        line-height: $gnb-height;
        cursor: pointer;

        &.opened {
            @apply text-violet-400;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-violet-400;
            }
        }
    }
}
</style>
