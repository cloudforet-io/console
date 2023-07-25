<template>
    <p-pane-layout class="job-basic-information">
        <header>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.BASIC_INFO') }}</header>
        <section class="items-container">
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.COLLECTOR') }}</label>
                <p-anchor :to="collector.linkLocation"
                          class="contents"
                          size="sm"
                >
                    {{ collector.label }}
                </p-anchor>
            </div>
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.CREATED') }}</label>
                <span class="contents">
                    {{ iso8601Formatter(job.created_at, timezone) }}
                </span>
            </div>
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.PLUGIN') }}</label>
                <span class="contents align-middle">
                    <p-lazy-img :src="plugin.icon"
                                error-icon="ic_cloud-filled"
                                :loading="!plugin.id"
                                :alt="plugin.label"
                                width="1rem"
                                height="1rem"
                                class="mr-1"
                    />
                    {{ plugin.label }}
                </span>
            </div>
            <div class="item">
                <label>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.FINISHED') }}</label>
                <span class="contents">
                    {{ iso8601Formatter(job.finished_at, timezone) }}
                </span>
            </div>
        </section>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed, onActivated, reactive, toRefs,
} from 'vue';

import { PAnchor, PLazyImg, PPaneLayout } from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { CollectorReferenceMap } from '@/store/modules/reference/collector/type';
import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    jobId: string;
}

export default {
    name: 'JobBasicInformation',
    components: { PPaneLayout, PAnchor, PLazyImg },
    props: {
        jobId: {
            type: String,
            required: true,
        },
    },
    setup(props: Props) {
        const state = reactive({
            loading: true,
            job: {} as any,
            collectors: computed<CollectorReferenceMap>(() => store.getters['reference/collectorItems']),
            plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
            timezone: computed(() => store.state.user.timezone),
            collector: computed(() => {
                const id = state.job.collector_info?.collector_id || '';
                return {
                    id,
                    label: state.collectors[id]?.label || id,
                    linkLocation: referenceRouter(id, { resource_type: 'inventory.Collector' }),
                };
            }),
            plugin: computed(() => {
                const id = state.job.collector_info?.plugin_info?.plugin_id || '';
                return {
                    id,
                    label: state.plugins[id]?.label || id,
                    icon: state.plugins[id]?.icon,
                };
            }),

        });

        const apiQuery = new ApiQueryHelper();
        const getJob = async () => {
            state.loading = true;
            state.job = {};
            try {
                apiQuery.setFilters([{ k: 'job_id', v: props.jobId, o: '=' }]);
                const { results } = await SpaceConnector.client.inventory.job.list({
                    query: apiQuery.data,
                });
                state.job = results[0] || {};
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        /* Init */
        onActivated(() => {
            getJob();
        });

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/collector/load'),
                store.dispatch('reference/plugin/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            iso8601Formatter,
        };
    },
};
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
