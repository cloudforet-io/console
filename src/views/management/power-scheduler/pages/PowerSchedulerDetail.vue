<template>
    <general-page-layout>
        <p-page-navigation :routes="routeState.route" />

        <header>
            <p-page-title :title="projectName"
                          child
                          @goBack="$router.push('/management/power-scheduler')"
            />
            <p-icon-text-button name="ic_plus_bold" style-type="primary-dark" size="sm">
                {{ $t('PWR_SCHED.CREATE') }}
            </p-icon-text-button>
        </header>

        <section class="list-section">
            <div v-if="loading">
                <div class="loading-backdrop fade-in" />
                <p-lottie name="thin-spinner" :size="2.5"
                          :auto="true" class="loading"
                />
            </div>
            <div v-else-if="isNoData" class="no-data">
                No Schedule List
            </div>
            <table v-else>
                <thead>
                    <tr>
                        <th class="name">
                            <strong>{{ $t('PWR_SCHED.LIST') }}</strong>&nbsp;({{ totalCount }})
                        </th>
                        <th class="edit">
                            {{ $t('PWR_SCHED.EDIT') }}
                        </th>
                        <th class="delete">
                            {{ $t('PWR_SCHED.DELETE') }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(schedule, index) in scheduleList" :key="index"
                        class="list-item"
                        :class="{ active: selectedScheduleId === schedule.schedule_id,
                                  'edit-mode': isEditMode
                        }"
                    >
                        <td class="name" @click="showDetail(schedule)">
                            <p-i v-if="selectedScheduleId === schedule.schedule_id"
                                 name="ic_check" height="1rem" width="1rem"
                                 color="transparent inherit"
                            /> {{ schedule.name }}
                        </td>
                        <td class="edit">
                            <span v-if="isEditMode && selectedScheduleId === schedule.schedule_id"
                                  class="edit-tag"
                            >{{ $t('PWR_SCHED.EDITING') }}</span>
                            <p-icon-button v-else class="edit" name="ic_edit"
                                           @click="onClickEdit(schedule)"
                            />
                        </td>
                        <td class="delete">
                            <p-icon-button class="delete" name="ic_trashcan" @click="onClickDelete(schedule)" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section v-if="selectedSchedule" :class="{'edit-mode': isEditMode}" class="detail-section">
            <p class="title">
                {{ $t('PWR_SCHED.EDIT_MODE') }}
            </p>
            <div class="detail-box">
                <schedule-time-table :schedule-id="selectedSchedule.schedule_id" :edit-mode.sync="isEditMode" />
                <schedule-kanban class="kanban" :schedule-id="selectedSchedule.schedule_id" :edit-mode.sync="isEditMode" />
            </div>
        </section>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance,
    reactive, toRefs,
} from '@vue/composition-api';

import { Timestamp } from '@/components/util/type';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import ScheduleKanban from '@/views/management/power-scheduler/modules/ScheduleKanban.vue';
import ScheduleTimeTable from '@/views/management/power-scheduler/modules/ScheduleTimeTable.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import { store } from '@/store';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

interface Schedule {
    // eslint-disable-next-line camelcase
    schedule_id: string;
    name: string;
    tags: object;
    // eslint-disable-next-line camelcase
    created_at: Timestamp;
    // eslint-disable-next-line camelcase
    resource_groups: ResourceGroup[];
    // eslint-disable-next-line camelcase
    'project_id': string;
    // eslint-disable-next-line camelcase
    'created_by': string;
}

interface ResourceGroup {
    priority: number;
    // eslint-disable-next-line camelcase
    resource_group_id: string;
}

export default {
    name: 'PowerSchedulerDetail',
    components: {
        PLottie,
        PIconButton,
        ScheduleTimeTable,
        PI,
        PIconTextButton,
        PPageTitle,
        PPageNavigation,
        GeneralPageLayout,
        ScheduleKanban,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        if (!props.projectId) vm.$router.push('/error-page');

        const projectName = computed(() => store.state.resource.project.items[props.projectId]?.label || props.projectId);

        /** Breadcrumb */
        const routeState = reactive({
            route: computed(() => [
                { name: 'Management', path: '/management' },
                { name: 'Power Scheduler', path: '/management/power-scheduler' },
                { name: `${projectName.value}`, path: `/management/power-scheduler/${props.projectId}` },
            ]),
        });

        const state = reactive({
            scheduleList: [] as Schedule[],
            totalCount: 0,
            resourceGroup: [] as unknown as ResourceGroup,
            resourceGroupId: [] as string [],
            loading: false,
            selectedSchedule: null as null|Schedule,
            // eslint-disable-next-line camelcase
            selectedScheduleId: computed(() => state.selectedSchedule?.schedule_id || ''),
            isNoData: computed(() => state.scheduleList.length === 0),
            isEditMode: false,
        });

        const listSchedule = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper().setFilter({ k: 'project_id', v: props.projectId, o: 'contain' });
                const res = await SpaceConnector.client.powerScheduler.schedule.list({ query: query.data },
                    {
                        headers: {
                            'Mock-Mode': 'true',
                        },
                    });

                console.debug('res', res);

                state.scheduleList = res.results;
                state.totalCount = res.total_count;
                state.selectedSchedule = state.scheduleList[0];
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const showDetail = async (schedule: Schedule) => {
            state.selectedSchedule = schedule;
        };

        const onClickEdit = (schedule: Schedule) => {
            state.selectedSchedule = schedule;
            state.isEditMode = true;
        };

        const onClickDelete = (schedule: Schedule) => {

        };

        const init = async () => {
            await store.dispatch('resource/project/load');
            await listSchedule();
        };

        init();

        return {
            projectName,
            routeState,
            ...toRefs(state),
            showDetail,
            onClickEdit,
            onClickDelete,
        };
    },
};
</script>

<style lang="postcss" scoped>
    header {
        @apply flex justify-between;
    }
    .list-section {
        @apply relative;
        min-height: 8rem;
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 0.5rem;
        }
        th {
            @apply font-normal text-xs text-gray-500;
        }
        th, td {
            &.name {
                @apply text-left;
            }
            &.edit {
                @apply text-center pr-4;
                width: 2rem;
            }
            &.delete {
                @apply text-center pr-6;
                width: 2rem;
            }
        }
        .list-item {
            @apply cursor-pointer bg-white;
            td {
                @apply border-t border-b border-gray-200;
                height: 3.5rem;
            }
            td:first-child {
                @apply border-l pl-6 rounded-l;
            }
            td:last-child {
                @apply border-r rounded-r;
            }
            &.active {
                td {
                    @apply border-primary text-primary;
                }
                &.edit-mode {
                    td {
                        @apply border-secondary text-secondary;
                    }
                }
            }
            &:hover {
                @apply bg-secondary2;
            }
        }
        .edit-tag {
            @apply bg-blue-200 text-secondary py-1 px-2 text-xs;
            border-radius: 2px;
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
    .detail-section {
        margin-top: 3rem;
        .title {
            @apply text-xs text-gray-500;
        }
        .detail-box {
            @apply mt-2 border border-gray-200;
            padding: 3.25rem 3rem;
            box-shadow: inset 0 0 1.25rem rgba(theme('colors.primary4'), 0.08);
            background-color: rgba(theme('colors.primary4'), 0.5);
        }
        &.edit-mode {
            .title {
                @apply text-secondary;
            }
            .detail-box {
                @apply border-secondary;
                box-shadow: inset 0 0 1.25rem rgba(theme('colors.secondary2'), 0.08);
                background-color: rgba(theme('colors.secondary2'), 0.5);
            }
        }
        .kanban {
            margin-top: 2.875rem;
        }
    }
</style>
