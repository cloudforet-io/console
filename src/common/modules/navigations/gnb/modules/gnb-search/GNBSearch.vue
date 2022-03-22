<template>
    <div class="gnb-search">
        <!-- TODO: apply responsive view - laptop, tablet, mobile
        <p-i name="ic_search--bold" />
        -->

        <g-n-b-search-input v-model="inputText"
                            @click.stop="showSuggestion"
                            @keyup.esc="hideSuggestion"
                            @keyup.down="showSuggestion"
        />

        <g-n-b-search-dropdown v-if="visibleSuggestion"
                               :input-text="trimmedInputText"
                               :loading="loading"
                               :menu-list="menuList"
                               :cloud-service-list="cloudServiceList"
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
            menuList: [] as any[],
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
            ] as any[],
        });

        const showSuggestion = () => {
            state.visibleSuggestion = true;
        };

        const hideSuggestion = () => {
            state.visibleSuggestion = false;
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
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-search {
    /* TODO */
}
</style>
