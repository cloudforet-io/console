<template>
    <div class="gnb-search">
        <!-- TODO: apply responsive view - laptop, tablet, mobile
        <p-i name="ic_search--bold" />
        -->

        <g-n-b-search-input v-model="inputText"
                            :is-focused.sync="isFocusOnInput"
                            @click.stop="showSuggestion"
                            @keyup.esc="hideSuggestion"
                            @keydown.up="moveFocusToSuggestion('END')"
                            @keydown.down="moveFocusToSuggestion('START')"
                            @input="handleUpdateInput"
        />

        <g-n-b-search-dropdown v-if="visibleSuggestion"
                               :input-text="trimmedInputText"
                               :loading="loading"
                               :menu-items="menuItems"
                               :cloud-service-items="cloudServiceItems"
                               :focus-start-position="focusStartPosition"
                               :is-focused.sync="isFocusOnSuggestion"
                               :is-recent="showRecent"
                               @move-focus-end="handleMoveFocusEnd"
                               @close="hideSuggestion"
                               @select="handleSelect"
        />
    </div>
</template>

<script lang="ts">
import axios, { CancelTokenSource } from 'axios';
import { flatten } from 'lodash';

import {
    computed, onMounted, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceRouter } from '@/router';

import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchInput.vue';
import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchDropdown.vue';
import {
    FocusStartPosition,
    SuggestionItem,
    SuggestionType,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { store } from '@/store';
import { GNBMenu } from '@/store/modules/display/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { menuRouterMap } from '@/lib/router/menu-router-map';

import { ASSET_MANAGEMENT_ROUTE } from '@/services/asset-management/route-config';


interface CloudService {
    id: string;
    provider: string;
    group: string;
    name: string;
    icon: string;
}

const getSubMenuList = (menu: GNBMenu[]) => menu.map(d => (d.subMenuList?.length ? d.subMenuList.map(item => ({
    ...item,
    parents: [{ id: d.id, label: d.label }],
})) : { id: d.id, label: d.label }));

export default {
    name: 'GNBSearch',
    components: {
        GNBSearchDropdown,
        GNBSearchInput,
        // PI,
    },
    setup() {
        const state = reactive({
            visibleSuggestion: false,
            inputText: '',
            trimmedInputText: computed<string>(() => {
                if (state.inputText) return state.inputText.trim();
                return '';
            }),
            loading: true,
            allMenuItems: computed<SuggestionItem[]>(() => {
                const menu = store.getters['display/GNBMenuList'];
                return flatten(getSubMenuList(menu));
            }),
            cloudServiceList: [] as CloudService[],
            searchRegex: computed(() => {
                let regex = '';
                if (state.inputText) {
                    // remove spaces in the search term
                    const text = state.inputText.replace(/\s/g, '');
                    for (let i = 0; i < text.length; i++) {
                        regex += text[i];
                        // add space regex after every single character to find matching keywords ignoring spaces
                        if (i < text.length - 1) regex += '\\s*';
                    }
                }
                return new RegExp(regex, 'i');
            }),
            menuItems: computed<SuggestionItem[]>(() => {
                if (state.showRecent) return state.recentMenuList;

                const regex = state.searchRegex;

                return state.allMenuItems.map(d => ({
                    name: d.id,
                    label: d.label,
                    parents: d.parents ? d.parents : undefined,
                })).filter((d) => {
                    if (regex.test(d.label)) return true;
                    if (d.parents && d.parents.some(p => regex.test(p.label))) return true;
                    return false;
                });
            }),
            cloudServiceItems: computed<SuggestionItem[]>(() => {
                const cloudServiceList = state.showRecent ? state.recentCloudServiceList : state.cloudServiceList;
                return cloudServiceList.map(d => ({
                    name: d.id,
                    label: d.name,
                    icon: d.icon,
                    defaultIcon: d.icon,
                    parents: [{ name: d.group, label: d.group }],
                    provider: d.provider,
                }));
            }),
            isFocusOnInput: false,
            isFocusOnSuggestion: false,
            focusStartPosition: 'START',
            showRecent: computed(() => state.visibleSuggestion && !state.inputText.length),
            recentMenuList: [] as SuggestionItem[],
            recentCloudServiceList: [] as CloudService[],
        });

        /* Util */
        const getConvertedCloudServiceList = (rawData): CloudService[] => rawData.map(d => ({
            id: d.data.id,
            name: d.data.name,
            group: d.data.group,
            provider: d.data.provider,
            icon: d.data.icon,
        }));


        /* API */
        let listRecentToken: CancelTokenSource | undefined;
        const listRecent = async (type) => {
            state.loading = true;

            if (listRecentToken) {
                listRecentToken.cancel('Next request has been called.');
                listRecentToken = undefined;
            }

            listRecentToken = axios.CancelToken.source();
            try {
                const { results } = await SpaceConnector.client.addOns.recent.list({
                    type,
                    limit: 5,
                }, {
                    cancelToken: listRecentToken.token,
                });
                listRecentToken = undefined;

                if (type === 'MENU') state.recentMenuList = results.map(d => d.data);
                if (type === 'CLOUD_SERVICE') state.recentCloudServiceList = results.map(d => d.data);
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }
            } finally {
                state.loading = false;
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
        const showSuggestion = () => {
            state.visibleSuggestion = true;
        };

        const hideSuggestion = () => {
            state.inputText = '';
            state.visibleSuggestion = false;
            state.isFocusOnInput = false;
            state.isFocusOnSuggestion = false;
        };

        const moveFocusToSuggestion = (focusStartPosition: FocusStartPosition) => {
            if (!state.visibleSuggestion) state.visibleSuggestion = true;
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
                state.cloudServiceList = getConvertedCloudServiceList(results);
            }
            /*
             TODO: update menuList & cloudServiceList
             if (inputText)
                 filter store.state.display.gnbMenuList by inputText for menuList
                 call autocomplete.reference api for cloudServiceList
             else
                 show recent items
             */
        };

        const handleSelect = (index: number, type: SuggestionType) => {
            if (type === 'MENU') {
                const menu = state.menuItems[index];
                const menuRoute = menuRouterMap[menu.name];
                if (menuRoute && SpaceRouter.router.currentRoute.name !== menuRoute.name) {
                    createRecent(type, menu);
                    SpaceRouter.router.push({
                        name: menuRoute.name,
                    });
                }
            } else {
                const cloudServiceItem = state.cloudServiceItems[index];
                if (cloudServiceItem) {
                    createRecent(type, cloudServiceItem);
                    SpaceRouter.router.push({
                        name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                        params: {
                            provider: cloudServiceItem.provider,
                            group: cloudServiceItem.parents[0].name,
                            name: cloudServiceItem.label,
                        },
                    });
                }
            }
            hideSuggestion();
        };

        onMounted(() => {
            window.addEventListener('click', hideSuggestion);
            window.addEventListener('blur', hideSuggestion);
        });
        onUnmounted(() => {
            window.removeEventListener('click', hideSuggestion);
            window.removeEventListener('blur', hideSuggestion);
        });

        /* Watcher */
        watch(() => state.visibleSuggestion, (visibleSuggestion) => {
            if (visibleSuggestion) {
                listRecent('MENU');
                listRecent('CLOUD_SERVICE');
            }
        });

        return {
            ...toRefs(state),
            showSuggestion,
            hideSuggestion,
            moveFocusToSuggestion,
            handleMoveFocusEnd,
            handleUpdateInput,
            handleSelect,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-search {
    /* TODO */
}
</style>
