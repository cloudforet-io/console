<script setup lang="ts">
import { reactive } from 'vue';

import { PTab } from '@spaceone/design-system';

import GNBSearchServiceTab
    from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/gnb-search-dropdown/modules/GNBSearchServiceTab.vue';


interface Props {
    inputText: string;
    loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    inputText: '',
    loading: true,
});


const state = reactive({
    activeTab: 'service',
    tabs: [
        { label: 'Service', name: 'service' },
        { label: 'Service Account', name: 'service-account' },
        { label: 'Project', name: 'project' },
        { label: 'Dashboard', name: 'dashboard' },
        { label: 'Cloud Service', name: 'cloud-service' },
        { label: 'User', name: 'user' },
    ],
});


</script>

<template>
    <div class="gnb-search-dropdown">
        <slot name="search-input" />
        <p-tab :active-tab.sync="state.activeTab"
               :tabs="state.tabs"
        >
            <template #service>
                <g-n-b-search-service-tab
                    :input-text="props.inputText"
                    :loading="props.loading"
                />
            </template>
        </p-tab>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-search-dropdown {
    @apply fixed rounded-xs;
    display: flex;
    flex-direction: column;
    max-width: 47.5rem;
    width: 100%;
    top: 3.125rem;
    left: 0;
    right: 0;
    margin: 0 auto;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
    z-index: 1000;

    /* custom design-system component - p-data-loader */
    :deep(.p-tab) {
        flex-grow: 1;
        .data-loader-container {
            max-height: calc(100vh - $top-bar-height - 5rem);
            min-height: 14.875rem;
            overflow-y: auto;
        }

        .tab-pane {
            padding-bottom: 0;
        }
    }
}

@screen mobile {
    .gnb-search-dropdown {
        @apply flex flex-col;
        position: fixed;
        top: $top-bar-height;
        width: 100vw;
        height: calc(100vh - $top-bar-height - 0.5rem);
        margin-top: -0.5rem;

        /* custom design-system component - p-data-loader */
        :deep(.p-data-loader) {
            @apply flex-grow;
            .data-loader-container {
                @apply flex items-center;
                .data-wrapper {
                    width: 100%;
                }
            }
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    margin: 2.5rem 0;

    .no-data-text {
        em {
            @apply font-bold text-gray-500;
        }
    }
}
</style>
