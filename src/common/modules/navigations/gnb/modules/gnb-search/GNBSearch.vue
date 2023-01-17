<template>
    <div v-click-outside="hideSearchMenu"
         class="gnb-search"
         @click.stop
    >
        <g-n-b-search-input v-if="isOverLaptopSize"
                            v-model="inputText"
                            :is-focused.sync="isFocusOnInput"
                            @click="showSearchMenu"
                            @esc="hideSearchMenu"
                            @arrow-up="moveFocusToSuggestion('UPWARD')"
                            @arrow-down="moveFocusToSuggestion('DOWNWARD')"
                            @input="handleUpdateInput"
        />

        <span v-else
              class="menu-button"
              tabindex="0"
              role="button"
              @click.stop="handleSearchButtonClick"
              @keydown.esc="hideSearchMenu"
              @keydown.enter="showSearchMenu"
        >
            <p-i name="ic_search--bold"
                 height="1.5rem"
                 width="1.5rem"
                 color="inherit"
            />
        </span>
        <g-n-b-search-dropdown v-show="visible"
                               :input-text="trimmedInputText"
                               :loading="loading"
                               :items="dataState.dropdownItems"
                               :focusing-direction.sync="focusingDirection"
                               :is-focused.sync="isFocusOnSuggestion"
                               :is-recent="showRecent"
                               :search-limit="SEARCH_LIMIT"
                               @move-focus-end="handleMoveFocusEnd"
                               @close="hideSearchMenu"
                               @select="handleSelect"
        >
            <template #search-input>
                <g-n-b-search-input v-if="!isOverLaptopSize"
                                    v-model="inputText"
                                    :is-focused.sync="isFocusOnInput"
                                    @click="showSearchMenu"
                                    @esc="hideSearchMenu"
                                    @arrow-up="moveFocusToSuggestion('UPWARD')"
                                    @arrow-down="moveFocusToSuggestion('DOWNWARD')"
                                    @input="handleUpdateInput"
                />
            </template>
        </g-n-b-search-dropdown>
    </div>
</template>

<script lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import {
    computed, defineComponent, onMounted, onUnmounted,
    reactive, toRefs, watch,
} from 'vue';
import type { DirectiveFunction, SetupContext } from 'vue';

import { getTextHighlightRegex, PI, screens } from '@spaceone/design-system';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import { debounce, throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { RecentConfig } from '@/store/modules/recent/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertCloudServiceConfigToReferenceData,
    convertMenuConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import type { SuggestionMenu } from '@/lib/helper/menu-suggestion-helper';
import { getAllSuggestionMenuList } from '@/lib/helper/menu-suggestion-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import {
    SUGGESTION_TYPE,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchDropdown.vue';
import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchInput.vue';
import type { DropdownItem, FocusingDirection } from '@/common/modules/navigations/gnb/modules/gnb-search/type';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

interface CloudServiceData {
    id: string;
    provider: string;
    group: string;
    name: string;
    icon: string;
}

const LAPTOP_WINDOW_SIZE = screens.laptop.max;

const RECENT_LIMIT = 5;
const SEARCH_LIMIT = 15;

interface Props {
    visible: boolean
}
export default defineComponent<Props>({
    name: 'GNBSearch',
    components: {
        GNBSearchDropdown,
        GNBSearchInput,
        PI,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            isFocusOnInput: false,
            isFocusOnSuggestion: false,
            focusingDirection: 'DOWNWARD',
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
            recentMenuList: null as RecentConfig[]|null,
            allMenuList: computed<SuggestionMenu[]>(() => getAllSuggestionMenuList(store.getters['display/allMenuList'])),
            filteredMenuList: [] as SuggestionMenu[],
            _menuTotalCount: 0,
            _menuSuggestions: computed<SuggestionItem[]|null>(() => {
                if (!dataState.recentMenuList) return null;
                if (state.showRecent) {
                    return convertMenuConfigToReferenceData(dataState.recentMenuList, store.getters['display/allMenuList']);
                }
                return dataState.filteredMenuList.map((d) => ({
                    itemType: SUGGESTION_TYPE.MENU,
                    name: d.id,
                    label: d.label,
                    parents: d.parents ? d.parents.map((p) => ({ name: p.id, label: p.label })) : undefined,
                    icon: d.icon,
                }));
            }),
            // cloud service
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            filteredCloudServices: [] as CloudServiceData[],
            recentCloudServices: [] as RecentConfig[],
            _cloudServiceTotalCount: 0,
            _cloudServiceSuggestions: computed<SuggestionItem[]>(() => {
                if (state.showRecent) {
                    return convertCloudServiceConfigToReferenceData(dataState.recentCloudServices, dataState.cloudServiceTypes);
                }
                return dataState.filteredCloudServices.map((d) => ({
                    itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
                    name: d.id,
                    label: d.name,
                    icon: d.icon,
                    defaultIcon: d.icon,
                    parents: [{ name: d.group, label: d.group }],
                    provider: d.provider,
                }));
            }),
            // all
            dropdownItems: computed<DropdownItem[]>(() => {
                const items: DropdownItem[] = [
                    {
                        itemType: SUGGESTION_TYPE.MENU,
                        totalCount: dataState._menuTotalCount,
                        suggestionItems: dataState._menuSuggestions,
                    },
                ];

                if (isUserAccessibleToMenu(MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, store.getters['user/pagePermissionList'])) {
                    items.push({
                        itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
                        totalCount: dataState._cloudServiceTotalCount,
                        suggestionItems: dataState._cloudServiceSuggestions,
                    });
                }
                return items;
            }),
        });

        const setVisible = (visible: boolean) => {
            emit('update:visible', visible);
        };

        const filterMenuItemsBySearchTerm = (menu: SuggestionMenu[], searchTerm?: string): SuggestionMenu[] => {
            const regex = getTextHighlightRegex(searchTerm);
            const results = menu.map((d) => ({
                id: d.id,
                label: d.label,
                parents: d.parents ? d.parents : undefined,
                icon: d.parents?.[0]?.icon ?? d.icon,
            })).filter((d) => {
                if (regex.test(d.label as string)) return true;
                if (d.parents && d.parents.some((p) => regex.test(p.label as string))) return true;
                return false;
            });

            dataState._menuTotalCount = results.length;
            return results.slice(0, SEARCH_LIMIT);
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
                state.loading = true;
                const { results, total_count } = await SpaceConnector.client.addOns.autocomplete.resource({
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
                dataState._cloudServiceTotalCount = total_count;
                return results;
            } catch (e: any) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }
                dataState._cloudServiceTotalCount = 0;
                return [];
            } finally {
                state.loading = false;
            }
        };
        const listSearchRecent = async (type: SuggestionType) => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.addOns.recent.search.list({
                    type,
                    limit: RECENT_LIMIT,
                });
                const recentConfig: RecentConfig[] = results.map((d) => ({
                    itemType: d.data.type,
                    itemId: d.data.id,
                    updatedAt: d.updated_at,
                }));
                if (type === SUGGESTION_TYPE.MENU) dataState.recentMenuList = recentConfig;
                else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) dataState.recentCloudServices = recentConfig;
            } catch (e) {
                ErrorHandler.handleError(e);
                if (type === SUGGESTION_TYPE.MENU) dataState.recentMenuList = [];
                else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) dataState.recentCloudServices = [];
            } finally {
                state.loading = false;
            }
        };
        const createSearchRecent = async (type: SuggestionType, id: string) => {
            try {
                await SpaceConnector.client.addOns.recent.search.create({
                    type,
                    id,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* Event */
        const showSearchMenu = async () => {
            state.isFocusOnSuggestion = false;
            if (!state.isFocusOnInput) state.isFocusOnInput = true;
            if (!props.visible) {
                state.loading = true;
                state.loading = false;
                setVisible(true);
            }
        };

        const hideSearchMenu = () => {
            if (props.visible) {
                setVisible(false);
                state.inputText = '';
                state.isFocusOnInput = false;
                state.isFocusOnSuggestion = false;
                dataState.filteredCloudServices = [];
                dataState.filteredMenuList = [];
            }
        };

        const moveFocusToSuggestion = (focusingDirection: FocusingDirection) => {
            if (!props.visible) setVisible(true);
            state.focusingDirection = focusingDirection;
            state.isFocusOnInput = false;
            state.isFocusOnSuggestion = true;
        };

        const handleSearchButtonClick = () => {
            if (!props.visible) showSearchMenu();
            else hideSearchMenu();
        };

        const handleMoveFocusEnd = () => {
            state.focusingDirection = undefined;
            state.isFocusOnSuggestion = false;
            state.isFocusOnInput = true;
        };

        const handleUpdateInput = debounce(async (e) => {
            if (!e.length) return;
            state.loading = true;
            if (state.trimmedInputText) {
                const results = await getCloudServiceResources(state.trimmedInputText);
                dataState.filteredCloudServices = results.map((d) => d.data);
                dataState.filteredMenuList = filterMenuItemsBySearchTerm(dataState.allMenuList, state.trimmedInputText);
            }
        }, 300, {
            leading: true,
        });

        const handleSelect = (index: number, type: SuggestionType) => {
            if (type === 'MENU') {
                const menuId = state.showRecent ? dataState.recentMenuList[index]?.itemId : dataState.filteredMenuList[index]?.id;
                if (!menuId) return;

                const menuInfo: MenuInfo = MENU_INFO_MAP[menuId];
                if (menuInfo && SpaceRouter.router.currentRoute.name !== menuId) {
                    SpaceRouter.router.push({ name: menuId }).catch(() => {});
                    if (!state.showRecent) createSearchRecent(type, menuId);
                }
            } else {
                let cloudServiceTypekey;
                if (state.showRecent) cloudServiceTypekey = dataState.recentCloudServices[index]?.itemId;
                else {
                    const cloudServiceId = dataState.filteredCloudServices[index]?.id;
                    if (!cloudServiceId) return;
                    const cloudService = dataState.cloudServiceTypes[cloudServiceId];
                    cloudServiceTypekey = cloudService.data.cloudServiceTypeKey;
                }
                if (cloudServiceTypekey) {
                    const itemInfo: string[] = cloudServiceTypekey.split('.');
                    SpaceRouter.router.push({
                        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: itemInfo[0],
                            group: itemInfo[1],
                            name: itemInfo[2],
                        },
                    }).catch(() => {
                    });
                    if (!state.showRecent) createSearchRecent(type, cloudServiceTypekey);
                }
            }
            hideSearchMenu();
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

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/cloudServiceType/load'),
            ]);
        })();

        /* Watcher */
        watch(() => props.visible, async (visible) => {
            if (visible) {
                await Promise.allSettled([
                    listSearchRecent(SUGGESTION_TYPE.MENU),
                    listSearchRecent(SUGGESTION_TYPE.CLOUD_SERVICE),
                ]);
            }
        });

        return {
            ...toRefs(state),
            dataState,
            SEARCH_LIMIT,
            showSearchMenu,
            hideSearchMenu,
            moveFocusToSuggestion,
            handleSearchButtonClick,
            handleMoveFocusEnd,
            handleUpdateInput,
            handleSelect,
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
