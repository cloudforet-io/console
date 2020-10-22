<template>
    <vertical-page-layout :min-width="270" :init-width="270" :max-width="400">
        <template #sidebar="{width}">
            <section class="list-section" :style="{width: width}">
                <p class="title">
                    <strong>{{ $t('PWR_SCHED.LIST') }}</strong>&nbsp;({{ totalCount }})
                </p>
                <p-hr />
                <div class="my-6 mx-4">
                    <p-icon-text-button name="ic_plus_bold" outline
                                        :disabled="mode !== 'READ'" block
                                        @click="onClickCreate"
                    >
                        {{ $t('PWR_SCHED.CREATE') }}
                    </p-icon-text-button>
                    <p-selectable-list :items="scheduleList" :loading="loading" :mapper="listMapper"
                                       :selected-indexes="selectedIndexes"
                                       :multi-selectable="false"
                                       theme="card"
                                       default-icon="ic_clock-history"
                                       :disabled="mode !== 'READ'"
                                       class="mt-6"
                                       @select="onSelectItem"
                    >
                        <template #loading>
                            <div />
                        </template>
                        <template #no-data>
                            <div class="no-data">
                                {{ $t('PWR_SCHED.NO_SCHED') }}
                            </div>
                        </template>
                        <template #contents="{item}">
                            <div class="item-contents">
                                <p class="item-name">
                                    {{ item.name }}
                                </p>
                                <span class="item-time">
                                    {{ getFormattedTime(item.created_at) }}
                                </span>
                            </div>
                        </template>
                    </p-selectable-list>
                </div>
            </section>
        </template>
        <p-page-navigation :routes="routeState.route" />
        <div v-if="loading">
            <div class="loading-backdrop fade-in" />
            <p-lottie name="thin-spinner" :size="2.5"
                      :auto="true" class="loading"
            />
        </div>
        <schedule-detail v-else
                         :schedule-id="selectedSchedule ? selectedSchedule.schedule_id : ''"
                         :project-id="projectId"
                         :mode="mode"
                         @update="onUpdate"
                         @delete="onDelete"
                         @create="onCreate"
                         @cancel="onCancel"
        />
    </vertical-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { store } from '@/store';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import ScheduleDetail from '@/views/automation/power-scheduler/modules/ScheduleDetail.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { getTimezone, showErrorMessage, showSuccessMessage } from '@/lib/util';
import VerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/PSelectableList.vue';
import { pointViolet, gray } from '@/styles/colors';
import { ViewMode } from '@/views/automation/power-scheduler/type';
import { findIndex } from 'lodash';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { DateTime } from 'luxon';

dayjs.extend(timezone);

interface Schedule {
    // eslint-disable-next-line camelcase
    schedule_id: string;
    name: string;
}

const EXPECTED_STATES = {
    RUNNING: {
        label: 'Running',
        color: pointViolet,
        icon: 'ic_clock-history',
    },
    STOPPED: {
        label: 'Stopped',
        color: gray[900],
        icon: 'ic_clock-history--on',
    },
};

interface Props {
    projectId: string;
    scheduleId?: string;
}

const listMapper = {
    icon: d => EXPECTED_STATES[d.expected_state]?.icon || '',
};
const getFormattedTime = time => dayjs.unix(time.seconds).tz(getTimezone()).format('YYYY-MM-DD');

export default {
    name: 'PowerSchedulerPage',
    components: {
        PLottie,
        PSelectableList,
        PHr,
        VerticalPageLayout,
        ScheduleDetail,
        PIconTextButton,
        PPageNavigation,
    },
    props: {
        projectId: {
            type: String,
            required: true,
        },
        scheduleId: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        if (!props.projectId) vm.$router.push('/error-page');

        /** Breadcrumb */
        const routeState = reactive({
            projectName: computed(() => store.state.resource.project.items[props.projectId]?.label || props.projectId),
            route: computed(() => [
                { name: 'Automation', path: '/automation' },
                { name: 'Power Scheduler', path: '/automation/power-scheduler' },
                { name: `${routeState.projectName}`, path: `/automation/power-scheduler/${props.projectId}` },
            ]),
        });

        const state = reactive({
            title: computed(() => state.selectedSchedule?.name || vm.$t('PWR_SCHED.CREATE')),
            scheduleList: [] as Schedule[],
            totalCount: 0,
            loading: true,
            selectedIndexes: [],
            selectedSchedule: computed(() => state.scheduleList[state.selectedIndexes[0]] || null),
            mode: computed(() => {
                if (state.loading) return 'READ';
                if (vm.$route.params.scheduleId) return 'READ';
                return 'CREATE';
            }),
        });


        const setMode = async () => {
            if (state.selectedSchedule?.schedule_id) {
                try {
                    await vm.$router.replace({
                        params: {
                            projectId: props.projectId,
                            scheduleId: state.selectedSchedule.schedule_id,
                        },
                    });
                } catch (e) {}
            } else {
                try {
                    await vm.$router.replace({
                        params: {
                            projectId: props.projectId,
                            scheduleId: undefined as unknown as string,
                        },
                    });
                } catch (e) {}
            }
        };

        const redirectToLandingPage = async () => {
            try {
                await vm.$router.replace({
                    name: 'powerSchedulerLanding',
                    params: {},
                });
            } catch (e) {}

            showErrorMessage('Invalid URL', 'Please check Project ID', root);
        };

        const validateProjectId = async (): Promise<boolean> => {
            await store.dispatch('resource/project/load');
            return !!store.state.resource.project.items[props.projectId];
        };


        const listSchedule = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper().setFilter({ k: 'project_id', v: props.projectId, o: 'contain' });
                const res = await SpaceConnector.client.powerScheduler.schedule.list({ query: query.data });

                state.scheduleList = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                state.scheduleList = [];
                state.totalCount = 0;
                state.selectedIndexes = [];
                await setMode();
            } finally {
                state.loading = false;
            }
        };


        const onClickCreate = async () => {
            state.selectedIndexes = [];
            await setMode();
        };


        const initSelectedSchedule = async () => {
            if (state.scheduleList.length === 0) {
                state.selectedIndexes = [];
            } else {
                const idx = findIndex(state.scheduleList, { schedule_id: props.scheduleId });
                if (idx === -1) state.selectedIndexes = [0];
                else state.selectedIndexes = [idx];
            }

            await setMode();
        };


        const onCreate = async () => {
            await listSchedule();
            await initSelectedSchedule();
        };

        const onDelete = async () => {
            await listSchedule();
            await initSelectedSchedule();
        };

        const onCancel = async () => {
            await initSelectedSchedule();
        };

        const onUpdate = async () => {
            await listSchedule();
            await initSelectedSchedule();
        };

        const onSelectItem = async (idxes) => {
            state.selectedIndexes = idxes;
            await setMode();
        };

        (async () => {
            if (!await validateProjectId()) {
                await redirectToLandingPage();
                return;
            }

            await listSchedule();
            await initSelectedSchedule();

            // invalid scheduleId case
            if (props.scheduleId && !state.selectedSchedule) {
                await redirectToLandingPage();
            }

            // watch(() => state.selectedSchedule, async () => {
            //     await setMode();
            // }, { immediate: true });
        })();

        return {
            ...toRefs(state),
            routeState,
            onClickCreate,
            onCreate,
            onDelete,
            onCancel,
            onUpdate,
            onSelectItem,
            listMapper,
            getFormattedTime,
            EXPECTED_STATES,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .p-selectable-list::v-deep {
        .item-container {
            @apply mb-2;
        }
        .item-contents {
            @apply ml-4 leading-none;
        }
        .item-name {
            @apply text-sm leading-normal text-gray-900 truncate;
        }
        .item-time {
            @apply text-xs text-gray-500;
            line-height: 1.2;
        }
        .no-data {
            @apply mt-6 mx-4 text-gray-200 font-normal;
            line-height: 1.2;
        }
    }
    .list-section {
        @apply relative mx-1 mt-8;
        min-height: 8rem;
        .title {
            @apply font-normal text-sm text-gray-500 leading-normal mb-2 mx-4;
        }
        .loading-backdrop {
            @apply absolute w-full h-full overflow-hidden;
            background-color: white;
            opacity: 0.5;
            top: 0;
            z-index: 1;
        }
        .loading {
            @apply absolute flex w-full h-full justify-center items-center;
            top: 0;
            max-height: 16.875rem;
        }
        .fade-in-enter-active {
            transition: opacity 0.2s;
        }
        .fade-in-leave-active {
            transition: opacity 0.2s;
        }
        .fade-in-enter, .fade-in-leave-to {
            opacity: 0;
        }
        .fade-in-leave, .fade-in-enter-to {
            opacity: 0.5;
        }
    }

</style>
