<template>
    <vertical-page-layout :min-width="270" :init-width="270" :max-width="400">
        <template #sidebar="{width}">
            <div class="px-3 mt-10 mb-12">
                <p-icon-text-button name="ic_plus_bold" outline
                                    style-type="gray900"
                                    :disabled="mode === 'CREATE' || isEditing" block
                                    @click="onClickCreate"
                >
                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CREATE_SCHEDULER') }}
                </p-icon-text-button>
            </div>
            <section class="list-section" :style="{width: width}">
                <p class="title">
                    <strong>{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SCHEDULER_LIST') }}</strong>&nbsp;({{ totalCount }})
                </p>
                <p-divider />
                <div class="my-6 mx-3">
                    <p-selectable-list :items="scheduleList" :loading="loading" :mapper="listMapper"
                                       :selected-indexes="selectedIndexes"
                                       :multi-selectable="false"
                                       theme="card"
                                       default-icon="ic_power-off"
                                       :disabled="mode === 'CREATE' || isEditing"
                                       icon-size="1.5rem"
                                       class="mt-6"
                                       @select="onSelectItem"
                    >
                        <template #loading>
                            <div />
                        </template>
                        <template #no-data>
                            <div class="no-data">
                                {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.NO_DATA') }}
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
        <p-breadcrumbs :routes="routeState.route" />
        <div class="detail-container">
            <template v-if="loading">
                <div class="loading-backdrop fade-in" />
                <p-lottie name="thin-spinner" :size="2.5"
                          :auto="true" class="loading"
                />
            </template>
            <schedule-detail v-else
                             :schedule-id="selectedSchedule ? selectedSchedule.schedule_id : ''"
                             :project-id="projectId"
                             :mode="mode"
                             :first-create="mode === 'CREATE' && scheduleList.length === 0"
                             @update="onUpdate"
                             @delete="onDelete"
                             @create="onCreate"
                             @cancel="onCancel"
                             @edit-start="onEditStart"
                             @edit-finish="onEditFinish"
            />
        </div>
    </vertical-page-layout>
</template>

<script lang="ts">
import { findIndex } from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

import {
    ComponentRenderProxy,
    computed, reactive, toRefs, getCurrentInstance,
} from '@vue/composition-api';

import {
    PSelectableList, PBreadcrumbs, PIconTextButton, PDivider, PLottie
} from '@spaceone/design-system';

import VerticalPageLayout from '@/views/common/components/page-layout/VerticalPageLayout.vue';
import ScheduleDetail from '@/views/automation/power-scheduler/modules/ScheduleDetail.vue';
import { DESIRED_STATES, Schedule } from '@/views/automation/power-scheduler/type';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { showErrorMessage } from '@/lib/util';
import { store } from '@/store';
import router from '@/routes';

dayjs.extend(timezone);


interface Props {
    projectId: string;
    scheduleId?: string;
}

const listMapper = {
    icon: d => DESIRED_STATES[d.desired_state]?.icon || '',
};
const getFormattedTime = time => dayjs.unix(time.seconds).tz(store.state.user.timezone).format('YYYY-MM-DD');

const validateProjectId = async (projectId): Promise<boolean> => {
    await store.dispatch('resource/project/load');
    return !!store.state.resource.project.items[projectId];
};

export default {
    name: 'PowerSchedulerPage',
    components: {
        PLottie,
        PSelectableList,
        PDivider,
        VerticalPageLayout,
        ScheduleDetail,
        PIconTextButton,
        PBreadcrumbs,
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
    beforeRouteEnter(to, from, next) {
        (async () => {
            if (!await validateProjectId(to.params.projectId)) {
                showErrorMessage(
                    router.app.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_PROJECT_INVALID_TITLE'),
                    router.app.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_PROJECT_INVALID_DESC'),
                    router.app.$root,
                );
                next({
                    name: 'powerSchedulerLanding',
                    params: {},
                });
                return;
            }

            next();
        })();
    },
    setup(props: Props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        if (!props.projectId) vm.$router.push('/error-page');

        /** Breadcrumb */
        const routeState = reactive({
            projectName: computed(() => store.state.resource.project.items[props.projectId]?.label || props.projectId),
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.POWER_SCHEDULER'), path: '/automation/power-scheduler' },
                { name: `${routeState.projectName}` },
            ]),
        });

        const state = reactive({
            title: computed(() => state.selectedSchedule?.name || vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.CREATE_SCHEDULER')),
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
            isEditing: false,
        });


        const setMode = async () => {
            if (state.selectedSchedule?.schedule_id) {
                try {
                    await vm.$router.replace({
                        name: 'powerSchedulerDetail',
                        params: {
                            projectId: props.projectId,
                            scheduleId: state.selectedSchedule.schedule_id,
                        },
                    });
                } catch (e) {}
            } else {
                try {
                    await vm.$router.replace({
                        name: 'powerScheduler',
                        params: {
                            projectId: props.projectId,
                        },
                    });
                } catch (e) {}
            }
        };


        const apiQuery = new ApiQueryHelper();
        const listSchedule = async (init = false) => {
            state.loading = true;
            try {
                apiQuery.setSort('created_at')
                    .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]);

                const res = await SpaceConnector.client.powerScheduler.schedule.list({
                    // eslint-disable-next-line camelcase
                    include_desired_state: true,
                    query: apiQuery.data,
                });

                state.scheduleList = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                state.scheduleList = [];
                state.totalCount = 0;
                state.selectedIndexes = [];
                await setMode();
            } finally {
                if (!init)state.loading = false;
            }
        };


        const onClickCreate = async () => {
            state.selectedIndexes = [];
            await setMode();
        };


        const initSelectedSchedule = async (init = false) => {
            if (state.scheduleList.length === 0) {
                state.selectedIndexes = [];
                if (init && props.scheduleId) {
                    showErrorMessage(
                        vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_SCHEDULE_INVALID_TITLE'),
                        vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_SCHEDULE_INVALID_DESC'),
                        root,
                    );
                }
            } else {
                const idx = findIndex(state.scheduleList, { schedule_id: props.scheduleId });
                if (idx === -1) {
                    state.selectedIndexes = [0];
                    if (init && props.scheduleId) {
                        showErrorMessage(
                            vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_SCHEDULE_INVALID_TITLE'),
                            vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_SCHEDULE_INVALID_DESC'),
                            root,
                        );
                    }
                } else state.selectedIndexes = [idx];
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

        const onEditStart = () => {
            state.isEditing = true;
        };

        const onEditFinish = () => {
            state.isEditing = false;
        };

        const onSelectItem = async (idxes) => {
            state.selectedIndexes = idxes;
            await setMode();
        };

        // init
        (async () => {
            await listSchedule(true);
            await initSelectedSchedule(true);
            state.loading = false;
        })();


        return {
            ...toRefs(state),
            routeState,
            onClickCreate,
            onCreate,
            onDelete,
            onCancel,
            onUpdate,
            onEditStart,
            onEditFinish,
            onSelectItem,
            listMapper,
            getFormattedTime,
            DESIRED_STATES,
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
    @apply relative mx-1;
    min-height: 8rem;
    .title {
        @apply font-normal text-sm text-gray-900 leading-normal mb-2 mx-4;
    }
}

.detail-container {
    @apply relative w-full h-full;
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

</style>
