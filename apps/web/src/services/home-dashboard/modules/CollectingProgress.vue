<template>
    <widget-layout>
        <template #title>
            <div class="top">
                <p class="title">
                    {{ $t('COMMON.WIDGETS.COLLECTING_JOBS') }}
                </p>
                <router-link
                    :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }"
                    class="more-btn"
                >
                    <div class="more">
                        <span class="text-xs">{{ $t('COMMON.WIDGETS.CLOUD_SERVICE.SEE_MORE') }}</span>
                        <p-i name="ic_chevron-right"
                             width="1rem"
                             height="1rem"
                             color="inherit transparent"
                        />
                    </div>
                </router-link>
            </div>
        </template>
        <template v-if="loading">
            <div v-for="skeleton in skeletons"
                 :key="skeleton"
                 class="grid grid-cols-1 gap-1 my-4 w-full"
            >
                <p-skeleton width="80%"
                            height="0.625rem"
                />
                <p-skeleton width="100%"
                            height="0.625rem"
                />
            </div>
        </template>
        <div v-else-if="!loading && items.length > 0">
            <div v-for="(item, index) in items"
                 :key="index"
                 class="card grid grid-cols-12 cursor-pointer"
                 @click="goToCollectorHistory(item)"
            >
                <div class="left-part col-span-10">
                    <span class="collector-provider"
                          :style="{color: providers[item.collector_info.provider] ? providers[item.collector_info.provider].color : undefined }"
                    >{{ providers[item.collector_info.provider] ? providers[item.collector_info.provider].label : item.collector_info.provider }}</span>
                    <span class="collector-title">{{ item.collector_info.name }}</span>
                    <br><span class="time">{{ timeFormatter(item.created_at) }}</span>
                </div>
                <div class="right-part col-span-2">
                    <p-i name="ic_settings-filled"
                         animation="spin"
                         width="1.5rem"
                         height="1.5rem"
                    />
                </div>
            </div>
        </div>
        <div v-else
             class="no-data-wrapper"
        >
            <p-empty
                show-image
                :title="$t('COMMON.WIDGETS.COLLECTING_JOBS_NO_RUNNING')"
            >
                <template #image>
                    <img src="@/assets/images/illust_star.svg"
                         alt="empty-image"
                    >
                </template>
            </p-empty>
        </div>
    </widget-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PSkeleton, PI, PEmpty } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { TimeStamp } from '@/models';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel } from '@/services/asset-inventory/collector/model';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

enum COLLECT_MODE {
    all = 'ALL',
    create = 'CREATE',
    update = 'UPDATE'
}

enum JOB_STATE {
    created = 'CREATED',
    progress = 'IN_PROGRESS',
    failure = 'FAILURE',
    timeout = 'TIMEOUT',
    canceled = 'CANCELED',
    success = 'SUCCESS'
}

export interface JobModel {
        job_id: string;
        state: JOB_STATE;
        collect_mode: COLLECT_MODE;
        collector_info: CollectorModel;
        secret_id: string;
        filter: any;
        errors: {
            code: string;
            message: string;
            secret_id?: string;
        }[];
        created_at: TimeStamp;
        finished_at: TimeStamp;
    }

export default {
    name: 'CollectingProgress',
    components: {
        WidgetLayout,
        PSkeleton,
        PI,
        PEmpty,
    },
    props: {
        extraParams: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const state = reactive({
            loading: false,
            skeletons: range(2),
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            items: [] as JobModel[],
            fields: computed(() => [
                { label: i18n.t('COMMON.WIDGETS.COLLECTING_JOBS_TITLE_TIME'), name: 'collector_info' },
                { label: i18n.t('COMMON.WIDGETS.COLLECTING_JOBS_STATUS'), name: 'progress' },
            ]),
        });

        /* util */
        const convertJobsToFieldItem = (jobs) => {
            const items = [] as JobModel[];
            jobs.forEach((job) => {
                const newJob = {
                    progress: `${(Math.round((job.total_tasks - job.remained_tasks) / job.total_tasks) * 100)}%`,
                    ...job,
                };
                items.push(newJob);
            });
            return items;
        };
        const timeFormatter = (value) => {
            let time = dayjs(dayjs(value)).utc();
            if (state.timezone !== 'UTC') {
                time = dayjs(dayjs(value)).tz(state.timezone);
            }
            return time.format('MM-DD HH:mm ~');
        };

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getData = async () => {
            state.loading = true;
            try {
                apiQuery.setSort('created_at')
                    .setPage(1, 5)
                    .setFilters([{ k: 'status', v: [JOB_STATE.created, JOB_STATE.progress], o: '=' }]);
                const res = await SpaceConnector.client.inventory.job.list({
                    ...props.extraParams,
                    query: apiQuery.data,
                });
                state.items = convertJobsToFieldItem(res.results);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
            } finally {
                state.loading = false;
            }
        };

        const goToCollectorHistory = async (item) => {
            await vm.$router.push({
                name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME,
                hash: item.job_id,
            });
        };

        const init = async () => {
            await getData();
            // LOAD REFERENCE STORE
            await store.dispatch('reference/provider/load');
        };
        init();

        return {
            ...toRefs(state),
            ASSET_INVENTORY_ROUTE,
            timeFormatter,
            getData,
            goToCollectorHistory,
        };
    },
};
</script>

<style lang="postcss" scoped>
.top {
    @apply flex justify-between pb-4;
    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.2;
        font-weight: bold;
    }
    .more-btn {
        @apply flex-shrink-0 flex justify-end;
        font-size: 0.75rem;
        .more {
            @apply text-sm text-blue-600 font-normal float-right inline-flex items-center cursor-pointer float-right;
            &:hover {
                @apply text-secondary underline;
            }
        }
    }
}
.widget-layout {
    @apply border border-gray-100 rounded-lg;
    position: relative;
    min-height: 18.75rem;
}

.no-data-wrapper {
    position: absolute;
    width: 100%;
    left: 0;
    top: 6rem;
}
.card {
    @apply rounded-md;
    padding: 0.75rem 1rem;
    &:nth-child(odd) {
        @apply bg-primary4;
    }
    .left-part {
        .collector-provider {
            font-size: 0.875rem;
            line-height: 1.4;
            margin-right: 0.25rem;
        }
        .collector-title {
            @apply truncate;
            display: inline-block;
            max-width: 9rem;
            line-height: 1.4;
            vertical-align: top;
            font-size: 0.875rem;

            @media screen and (width < 576px) {
                max-width: initial;
            }
        }
        .time {
            @apply text-gray-500;
            font-size: 0.75rem;
            line-height: 1.5;
        }
    }
    .right-part {
        margin: auto;
    }
}
</style>
