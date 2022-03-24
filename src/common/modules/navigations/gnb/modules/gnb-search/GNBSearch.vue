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
import {
    computed, onMounted, onUnmounted,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { flatten } from 'lodash';

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
            cloudServiceList: [
                {
                    id: 'cloud-svc-type-aaa',
                    group: 'Lambda',
                    name: 'Function',
                    provider: 'aws',
                    icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg',
                },
                {
                    id: 'cloud-svc-type-bbb',
                    group: 'Lambda',
                    name: 'Layer',
                    provider: 'aws',
                    icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg',
                },
                {
                    id: 'cloud-svc-type-ccc',
                    group: 'EC2',
                    name: 'Instance',
                    provider: 'aws',
                    icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                },
            ] as CloudService[],
            menuItems: computed<SuggestionItem[]>(() => {
                if (state.showRecent) return state.recentMenuList;
                return state.allMenuItems.map(d => ({
                    name: d.id,
                    label: d.label,
                    parents: d.parents ? d.parents : undefined,
                }));
            }),
            cloudServiceItems: computed<SuggestionItem[]>(() => {
                const cloudServiceList = state.showRecent ? state.recentCloudServiceList : state.cloudServiceList;
                return cloudServiceList.map(d => ({
                    name: d.id,
                    label: d.name,
                    icon: d.icon,
                    defaultIcon: d.icon,
                    parents: [{ name: d.group, label: d.group }],
                }));
            }),
            isFocusOnInput: false,
            isFocusOnSuggestion: false,
            focusStartPosition: 'START',
            showRecent: computed(() => state.visibleSuggestion && !state.inputText.length),
            recentMenuList: [] as SuggestionItem[],
            recentCloudServiceList: [] as CloudService[],
        });

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
        const createRecent = async (type: SuggestionType, item: SuggestionItem|CloudService) => {
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

        const handleUpdateInput = () => {
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
                const cloudService: CloudService = state.cloudServiceList[index];
                if (cloudService && SpaceRouter.router.currentRoute.name !== ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE._NAME) {
                    createRecent(type, cloudService);
                    SpaceRouter.router.push({
                        name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE._NAME,
                        params: {
                            provider: cloudService.provider,
                            group: cloudService.group,
                            name: cloudService.name,
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
