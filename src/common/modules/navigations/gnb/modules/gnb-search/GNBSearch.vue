<template>
    <div v-click-outside="handleClickOutside" class="gnb-search">
        <g-n-b-search-input v-if="isOverLaptopSize" v-model="inputText"
                            :is-focused.sync="isFocusOnInput"
                            @click.stop="showSuggestion"
                            @keyup.esc="hideSuggestion"
                            @keydown.up="moveFocusToSuggestion('END')"
                            @keydown.down="moveFocusToSuggestion('START')"
                            @input="handleUpdateInput"
        />

        <span v-else
              class="menu-button"
        >
            <p-i v-if="proxyVisibleSuggestion"
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
                               :menu-items="menuSuggestions"
                               :cloud-service-type-items="cloudServiceTypeSuggestions"
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
                                    @click.stop="showSuggestion"
                                    @keyup.esc="hideSuggestion"
                                    @keydown.up="moveFocusToSuggestion('END')"
                                    @keydown.down="moveFocusToSuggestion('START')"
                                    @input="handleUpdateInput"
                />
            </template>
        </g-n-b-search-dropdown>
    </div>
</template>

<script lang="ts">
import axios, { CancelTokenSource } from 'axios';
import { flatten, throttle } from 'lodash';
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
import { GNBMenu } from '@/store/modules/display/type';


import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchInput.vue';
import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchDropdown.vue';
import {
    FocusStartPosition,
    SuggestionItem,
    SuggestionType,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { menuRouterMap } from '@/lib/router/menu-router-map';

import { ASSET_MANAGEMENT_ROUTE } from '@/services/asset-management/route-config';


interface CloudService {
    id: string;
    provider: string;
    group: string;
    name: string;
    icon: string;
}

const LAPTOP_WINDOW_SIZE = laptop.max;

const getSubMenuList = (menu: GNBMenu[]): SuggestionItem[] => flatten(menu.map(({ id, label, subMenuList }) => {
    if (subMenuList) {
        return subMenuList.map(item => ({
            name: item.id,
            label: item.label,
            parents: [{ name: id, label }],
        } as SuggestionItem));
    }
    return [{ name: id, label }] as SuggestionItem[];
}));

interface Props {
    visibleSuggestion: boolean;
}

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
            showRecent: computed(() => !state.inputText.length),
            isOverLaptopSize: window.innerWidth > LAPTOP_WINDOW_SIZE,
            loading: true,
            // data
            allMenuList: computed<SuggestionItem[]>(() => {
                const menu = store.getters['display/GNBMenuList'];
                return getSubMenuList(menu);
            }),
            filteredMenuList: [] as SuggestionItem[],
            cloudServiceTypeList: [] as CloudService[],
            recentMenuList: [] as SuggestionItem[],
            recentCloudServiceList: [] as CloudService[],
            // suggestion items
            menuSuggestions: computed<SuggestionItem[]>(() => {
                if (state.showRecent) return state.recentMenuList;
                return state.filteredMenuList;
            }),
            cloudServiceTypeSuggestions: computed<SuggestionItem[]>(() => {
                const cloudServiceTypeList = state.showRecent ? state.recentCloudServiceList : state.cloudServiceTypeList;
                return cloudServiceTypeList.map(d => ({
                    name: d.id,
                    label: d.name,
                    icon: d.icon,
                    defaultIcon: d.icon,
                    parents: [{ name: d.group, label: d.group }],
                    provider: d.provider,
                }));
            }),
        });

        /* Util */
        const getConvertedCloudServiceList = (rawData): CloudService[] => rawData.map(d => ({
            id: d.key,
            name: d.data.name,
            group: d.data.group,
            provider: d.data.provider,
            icon: d.data.icon,
        }));

        const getSearchRegex = (inputText?: string) => {
            let regex = '';
            if (inputText) {
                // remove spaces in the search term
                const text = state.inputText.replace(/\s/g, '');
                for (let i = 0; i < text.length; i++) {
                    regex += text[i];
                    // add space regex after every single character to find matching keywords ignoring spaces
                    if (i < text.length - 1) regex += '\\s*';
                }
            }
            return new RegExp(regex, 'i');
        };

        const filterMenuItemsBySearchTerm = (menuSuggestions: SuggestionItem[], searchTerm?: string) => {
            const regex = getSearchRegex(searchTerm);

            return menuSuggestions.map(d => ({
                name: d.name,
                label: d.label,
                parents: d.parents ? d.parents : undefined,
            })).filter((d) => {
                if (regex.test(d.label as string)) return true;
                if (d.parents && d.parents.some(p => regex.test(p.label as string))) return true;
                return false;
            }).slice(0, 5);
        };


        /* API */
        const listRecentTokens: Partial<Record<SuggestionType, CancelTokenSource|undefined>> = {
            MENU: undefined,
            CLOUD_SERVICE: undefined,
        };
        const listRecent = async (type) => {
            if (listRecentTokens[type]) {
                listRecentTokens[type].cancel('Next request has been called.');
                listRecentTokens[type] = undefined;
            }

            listRecentTokens[type] = axios.CancelToken.source();
            try {
                const { results } = await SpaceConnector.client.addOns.recent.list({
                    type,
                    limit: 5,
                }, {
                    cancelToken: listRecentTokens[type].token,
                });
                listRecentTokens[type] = undefined;

                if (type === 'MENU') state.recentMenuList = results.map(d => d.data);
                if (type === 'CLOUD_SERVICE') state.recentCloudServiceList = results.map(d => d.data);
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }
            }
        };

        const createRecent = async (type: SuggestionType, item: SuggestionItem) => {
            try {
                await SpaceConnector.client.addOns.recent.create({
                    type,
                    id: item.name,
                    data: item,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

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
                        limit: 5,
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
            if (!state.proxyVisibleSuggestion) {
                state.loading = true;
                state.proxyVisibleSuggestion = true;
                await Promise.allSettled([listRecent('MENU'), listRecent('CLOUD_SERVICE')]);
                state.loading = false;
            }
        };

        const hideSuggestion = () => {
            if (state.proxyVisibleSuggestion) {
                state.proxyVisibleSuggestion = false;
                state.inputText = '';
                state.isFocusOnInput = false;
                state.isFocusOnSuggestion = false;
                state.cloudServiceTypeList = [];
                state.filteredMenuList = [];
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
                state.cloudServiceTypeList = getConvertedCloudServiceList(results);
                state.filteredMenuList = filterMenuItemsBySearchTerm(state.allMenuList, state.trimmedInputText);
            }
        };

        const handleSelect = (index: number, type: SuggestionType) => {
            if (type === 'MENU') {
                const menu = state.menuSuggestions[index];
                const menuRoute = menuRouterMap[menu.name];
                if (menuRoute && SpaceRouter.router.currentRoute.name !== menuRoute.name) {
                    try {
                        SpaceRouter.router.push({
                            name: menuRoute.name,
                        });
                        createRecent(type, menu);
                    } catch (e) {}
                }
            } else {
                const cloudServiceTypeList = state.showRecent ? state.recentCloudServiceList : state.cloudServiceTypeList;
                const cloudServiceType = cloudServiceTypeList[index];
                if (cloudServiceType) {
                    try {
                        SpaceRouter.router.push({
                            name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                            params: {
                                provider: cloudServiceType.provider,
                                group: cloudServiceType.group,
                                name: cloudServiceType.name,
                            },
                        });
                        createRecent(type, cloudServiceType);
                    } catch (e) {}
                }
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

        return {
            ...toRefs(state),
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
