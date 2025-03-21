<template>
    <p-pane-layout class="job-basic-information">
        <header>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.BASIC_INFO') }}</header>
        <section class="items-container">
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.COLLECTOR') }}</label>
                <p-link action-icon="internal-link"
                        new-tab
                        :to="state.collector.linkLocation"
                        class="contents"
                        size="sm"
                >
                    {{ state.collector.label }}
                </p-link>
            </div>
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.CREATED') }}</label>
                <span class="contents">
                    {{ iso8601Formatter(props.job.created_at, storeState.timezone) }}
                </span>
            </div>
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.PLUGIN') }}</label>
                <span class="contents align-middle">
                    <p-lazy-img :src="state.plugin.icon"
                                error-icon="ic_cloud-filled"
                                :loading="!state.plugin.id"
                                :alt="state.plugin.label"
                                width="1rem"
                                height="1rem"
                                class="mr-1"
                    />
                    {{ state.plugin.label }}
                </span>
            </div>
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FINISHED') }}</label>
                <span class="contents">
                    {{ iso8601Formatter(props.job.finished_at, storeState.timezone) }}
                </span>
            </div>
        </section>
    </p-pane-layout>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PLink, PLazyImg, PPaneLayout } from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { JobModel } from '@/schema/inventory/job/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import { useUserStore } from '@/store/user/user-store';


import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';



interface Props {
    job: JobModel;
}

const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();

const props = withDefaults(defineProps<Props>(), {
    job: undefined,
});


const storeState = reactive({
    collectors: computed<CollectorReferenceMap>(() => allReferenceStore.getters.collector),
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
});
const state = reactive({
    collector: computed(() => {
        const id = props.job.collector_id || '';
        return {
            id,
            label: storeState.collectors[id]?.label || id,
            linkLocation: {
                name: appContextStore.getters.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                params: {
                    workspaceId: appContextStore.getters.isAdminMode ? undefined : userWorkspaceStore.getters.currentWorkspaceId,
                    collectorId: id,
                },
            },
        };
    }),
    plugin: computed(() => {
        const id = props.job.plugin_id || '';
        return {
            id,
            label: storeState.plugins[id]?.label || id,
            icon: storeState.plugins[id]?.icon,
        };
    }),

});
</script>

<style lang="postcss" scoped>
.job-basic-information {
    padding: 1rem;
    header {
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    .items-container {
        display: grid;
        grid-column-gap: 1rem;
        grid-row-gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
    }
    .item {
        display: inline-flex;
        align-items: flex-start;
        align-content: flex-start;
        label {
            @apply text-gray-600;
            font-size: 0.75rem;
            line-height: 1.5;
            margin-right: 0.25rem;
            white-space: nowrap;
        }
        .contents {
            font-size: 0.75rem;
            font-weight: bold;
            line-height: 1.5;
        }
    }
}

@screen tablet {
    .job-basic-information {
        .items-container {
            grid-template-columns: repeat(1, 1fr);
        }
    }
}
</style>
