<template>
    <general-page-layout>
        <p-page-navigation :routes="routeState.route" />

        <header>
            <p-page-title :title="projectName"
                          child
                          @goBack="$router.push('/management/power-scheduler')"
            />
            <p-icon-text-button name="ic_plus_bold" style-type="primary-dark"
                                :disabled="mode === 'CREATE'"
                                @click="onClickCreate"
            >
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
                        :class="{ active: isActiveItem(schedule),
                                  'edit-mode': mode !== 'READ',
                                  disabled: mode !== 'READ' && !isActiveItem(schedule)
                        }"
                    >
                        <td class="name" @click="showDetail(schedule)">
                            <p-i v-if="isActiveItem(schedule)"
                                 name="ic_check" height="1rem" width="1rem"
                                 color="transparent inherit"
                            /> {{ schedule.name }}
                        </td>
                        <td class="edit">
                            <span v-if="mode === 'UPDATE' && isActiveItem(schedule)"
                                  class="tag"
                            >{{ $t('PWR_SCHED.EDITING') }}</span>
                            <span v-else-if="mode === 'CREATE' && isActiveItem(schedule)"
                                  class="tag"
                            >{{ $t('PWR_SCHED.CREATING') }}</span>
                            <p-icon-button v-else class="edit" name="ic_edit"
                                           :disabled="mode !== 'READ' && !isActiveItem(schedule)"
                                           @click="onClickEdit(schedule)"
                            />
                        </td>
                        <td class="delete">
                            <p-icon-button class="delete" name="ic_trashcan"
                                           :disabled="mode !== 'READ' && !isActiveItem(schedule)"
                                           @click="onClickDelete(schedule)"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
        <schedule-detail v-if="selectedSchedule" :schedule-id.sync="selectedSchedule.schedule_id"
                         :project-id="projectId"
                         :mode.sync="mode"
                         :name.sync="selectedSchedule.name"
                         @cancel="onCancel"
        />
        <p-button-modal
            :header-title="headerTitle"
            :centered="true"
            :scrollable="false"
            size="md"
            :fade="true"
            :backdrop="true"
            :visible.sync="visible"
            :theme-color="themeColor"
            :footer-confirm-button-bind="{
                styleType: 'alert',
            }"
            @confirm="scheduleDeleteConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ modalContent }}
                </p>
            </template>
        </p-button-modal>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance,
    reactive, toRefs,
} from '@vue/composition-api';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import { store } from '@/store';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import ScheduleDetail from '@/views/management/power-scheduler/modules/ScheduleDetail.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

interface Schedule {
    // eslint-disable-next-line camelcase
    schedule_id: string;
    name: string;
}

export const modes = ['READ', 'CREATE', 'UPDATE'];
export type Mode = typeof modes[number];

// eslint-disable-next-line camelcase
const defaultSchedule: Schedule = { name: '', schedule_id: '' };


export default {
    name: 'PowerSchedulerDetail',
    components: {
        PButtonModal,
        ScheduleDetail,
        PLottie,
        PIconButton,
        PI,
        PIconTextButton,
        PPageTitle,
        PPageNavigation,
        GeneralPageLayout,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root }) {
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
            loading: true,
            selectedSchedule: null as null|Schedule,
            // eslint-disable-next-line camelcase
            mode: 'READ' as Mode,
        });

        const formState = reactive({
            visible: false,
            headerTitle: '',
            themeColor: '',
            modalContent: '',
            schedule_id: '',
        });

        const listSchedule = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper().setFilter({ k: 'project_id', v: props.projectId, o: 'contain' });
                const res = await SpaceConnector.client.powerScheduler.schedule.list({ query: query.data });

                state.scheduleList = res.results;
                state.totalCount = res.total_count;

                if (state.totalCount === 0) {
                    state.mode = 'CREATE';
                    // eslint-disable-next-line camelcase
                    state.scheduleList = [{ ...defaultSchedule }];
                }

                state.selectedSchedule = state.scheduleList[0];
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        // eslint-disable-next-line camelcase
        const isActiveItem = (schedule: Schedule) => state.selectedSchedule?.schedule_id === schedule.schedule_id;

        const showDetail = async (schedule: Schedule) => {
            if (state.mode === 'READ') {
                state.selectedSchedule = schedule;
            }
        };

        const onClickEdit = (schedule: Schedule) => {
            state.selectedSchedule = schedule;
            state.mode = 'UPDATE';
        };

        const onClickDelete = (schedule) => {
            formState.visible = true;
            formState.themeColor = 'alert';
            formState.headerTitle = '스케줄 그룹 삭제';
            formState.modalContent = '스케줄 그룹을 삭제하시겠습니까?';
            formState.schedule_id = schedule.schedule_id;
        };

        const scheduleDeleteConfirm = async () => {
            try {
                await SpaceConnector.client.powerScheduler.schedule.delete({
                    schedule_id: formState.schedule_id,
                });
                showSuccessMessage('성공', formState.headerTitle, root);
            } catch (e) {
                console.error(e);
                showErrorMessage(`${formState.headerTitle} 실패`, e, root);
            } finally {
                formState.visible = false;
                state.mode = 'READ';
                await listSchedule();
            }
        };

        const onClickCreate = () => {
            state.selectedSchedule = { ...defaultSchedule };
            state.scheduleList.push(state.selectedSchedule);
            state.mode = 'CREATE';
        };

        const onCancel = () => {
            if (state.mode === 'CREATE') {
                state.scheduleList.pop();
                if (state.scheduleList.length === 0) vm.$router.push('/management/power-scheduler');
                else state.selectedSchedule = state.scheduleList[0];
            }
            state.mode = 'READ';
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
            ...toRefs(formState),
            isActiveItem,
            showDetail,
            onClickEdit,
            onClickDelete,
            scheduleDeleteConfirm,
            onClickCreate,
            onCancel,
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
                width: 4.2rem;
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
            &.disabled {
                @apply bg-gray-200 text-gray-400;
                opacity: 0.8;
                cursor: default;
                &:hover {
                    @apply bg-gray-200;
                }
            }
            &:hover {
                @apply bg-secondary2;
            }
        }
        .tag {
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
</style>
