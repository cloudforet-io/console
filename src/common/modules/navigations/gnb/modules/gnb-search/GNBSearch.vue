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
                               @move-focus-end="handleMoveFocusEnd"
                               @close="hideSuggestion"
                               @select="handleSelect"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, onMounted, onUnmounted,
    reactive, toRefs,
} from '@vue/composition-api';

import { SpaceRouter } from '@/router';

import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchInput.vue';
import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchDropdown.vue';
import {
    FocusStartPosition,
    SuggestionItem,
    SuggestionType,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';

import { menuRouterMap } from '@/lib/router/menu-router-map';

import { ASSET_MANAGEMENT_ROUTE } from '@/services/asset-management/route-config';

interface ConsoleMenu {
    name: string;
    label: string;
    parents?: string[];
}

interface CloudService {
    cloud_service_type_id: string;
    provider: string;
    group: string;
    name: string;
    icon: string;
}

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
            loading: false,
            menuList: [
                { name: 'project', label: 'Project' },
                {
                    name: 'asset_management.service_account',
                    label: 'Service Account',
                    parents: ['Asset Management'],
                },
            ] as ConsoleMenu[],
            cloudServiceList: [
                {
                    cloud_service_type_id: 'cloud-svc-type-aaa',
                    group: 'Lambda',
                    name: 'Function',
                    provider: 'aws',
                    icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg',
                },
                {
                    cloud_service_type_id: 'cloud-svc-type-bbb',
                    group: 'Lambda',
                    name: 'Layer',
                    provider: 'aws',
                    icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg',
                },
                {
                    cloud_service_type_id: 'cloud-svc-type-ccc',
                    group: 'EC2',
                    name: 'Instance',
                    provider: 'aws',
                    icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                },
            ] as CloudService[],
            menuItems: computed<SuggestionItem[]>(() => state.menuList.map(d => ({
                name: d.name,
                label: d.label,
                parents: d.parent ? [d.parent] : undefined,
            }))),
            cloudServiceItems: computed<SuggestionItem[]>(() => state.cloudServiceList.map(d => ({
                name: d.cloud_service_type_id,
                label: d.name,
                icon: d.icon,
                defaultIcon: 'ic_provider_other',
                parents: [{ name: d.group, label: d.group }],
            }))),
            isFocusOnInput: false,
            isFocusOnSuggestion: false,
            focusStartPosition: 'START',
        });

        const showSuggestion = () => {
            state.visibleSuggestion = true;
        };

        const hideSuggestion = () => {
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
                const menu: ConsoleMenu = state.menuList[index];
                const menuRoute = menuRouterMap[menu.name];
                if (menuRoute && SpaceRouter.router.currentRoute.name !== menuRoute.name) {
                    SpaceRouter.router.push({
                        name: menuRoute.name,
                    });
                    // TODO: update recent
                }
            } else {
                const cloudService: CloudService = state.cloudServiceList[index];
                if (cloudService && SpaceRouter.router.currentRoute.name !== ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE._NAME) {
                    SpaceRouter.router.push({
                        name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE._NAME,
                        params: {
                            provider: cloudService.provider,
                            group: cloudService.group,
                            name: cloudService.name,
                        },
                    });
                    // TODO: update recent
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
