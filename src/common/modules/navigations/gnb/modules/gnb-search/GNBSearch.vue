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
        />
    </div>
</template>

<script lang="ts">
import {
    computed, onMounted, onUnmounted,
    reactive, toRefs,
} from '@vue/composition-api';


import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchInput.vue';
import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchDropdown.vue';
import {
    FocusStartPosition,
    SuggestionItem,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';


interface ConsoleMenu {
    name: string;
    label: string;
    parent?: ConsoleMenu;
}

interface CloudService {
    cloud_service_type_id: string;
    provider: string;
    group: string;
    name: string;
    tags: object;
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
                    parent: {
                        name: 'asset_management',
                        label: 'Asset Management',
                    },
                },
            ] as ConsoleMenu[],
            cloudServiceList: [
                {
                    cloud_service_type_id: 'cloud-svc-type-aaa',
                    group: 'Lambda',
                    tags: {
                        'spaceone:icon': 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg',
                    },
                    name: 'Function',
                    provider: 'aws',
                },
                {
                    cloud_service_type_id: 'cloud-svc-type-bbb',
                    group: 'Lambda',
                    tags: {
                        'spaceone:icon': 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg',
                    },
                    name: 'Layer',
                    provider: 'aws',
                },
                {
                    cloud_service_type_id: 'cloud-svc-type-ccc',
                    group: 'EC2',
                    tags: {
                        'spaceone:icon': 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                    },
                    name: 'Instance',
                    provider: 'aws',
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
                icon: d.tags['spaceone:icon'],
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
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-search {
    /* TODO */
}
</style>
