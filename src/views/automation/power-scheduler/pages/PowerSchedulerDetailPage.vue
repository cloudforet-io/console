<template>
    <vertical-page-layout :min-width="270" :init-width="270" :max-width="400">
        <template #sidebar="{width}">
            <section class="list-section" :style="{width: width}">
                <p class="title">
                    <strong>{{ $t('PWR_SCHED.LIST') }}</strong>&nbsp;({{ totalCount }})
                </p>
                <p-hr />
                <div class="my-6 mx-4">
                    <p-icon-text-button v-if="!isFirstTimeCreate" name="ic_plus_bold" outline
                                        :disabled="mode !== 'READ'" block
                                        @click="onClickCreate"
                    >
                        {{ $t('PWR_SCHED.CREATE') }}
                    </p-icon-text-button>
                    <p-selectable-list :items="scheduleList" :loading="loading"
                                       :selected-indexes.sync="selectedIndexes"
                                       :multi-selectable="false"
                                       theme="card"
                                       default-icon="ic_clock-history"
                                       :disabled="mode !== 'READ'"
                                       class="mt-6"
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
                                <span class="item-state">
                                    {{ EXPECTED_STATES[item.expected_state] ? EXPECTED_STATES[item.expected_state].label : 'test' }}
                                </span>
                            </div>
                        </template>
                    </p-selectable-list>
                </div>
            </section>
        </template>
        <p-page-navigation :routes="routeState.route" />

        <header>
            <p-page-title :title="projectName"
                          child
                          @goBack="$router.push('/automation/power-scheduler')"
            >
                <template #extra>
                    <p-icon-button v-if="mode === 'READ'" class="ml-2" name="ic_edit"
                                   @click="onClickEdit"
                    />
                    <p-icon-button v-if="mode === 'READ'" class="ml-2" name="ic_trashcan"
                                   @click="onClickDelete"
                    />
                    <div v-if="mode === 'UPDATE'" class="edit-tag">{{$t('PWR_SCHED.EDITING')}}</div>
                </template>
            </p-page-title>
        </header>

        <div v-if="loading">
            <div class="loading-backdrop fade-in" />
            <p-lottie name="thin-spinner" :size="2.5"
                      :auto="true" class="loading"
            />
        </div>
        <schedule-detail v-else-if="selectedSchedule"
                         :schedule-id="selectedSchedule.schedule_id"
                         :project-id="projectId"
                         :mode="mode"
                         :name="selectedSchedule.name"
                         @cancel="onCancel"
                         @confirm="onConfirm"
        />
        <p-button-modal
            :header-title="headerTitle"
            :centered="true"
            :scrollable="false"
            size="md"
            :fade="true"
            :backdrop="true"
            :visible.sync="visible"
            theme-color="alert"
            :footer-confirm-button-bind="{styleType: 'alert'}"
            @confirm="scheduleDeleteConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ $t('PWR_SCHED.CHECK_DELETE_DESC') }}
                </p>
            </template>
        </p-button-modal>
    </vertical-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance,
    reactive, toRefs,
} from '@vue/composition-api';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import { store } from '@/store';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import ScheduleDetail from '@/views/automation/power-scheduler/modules/ScheduleDetail.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import VerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/PSelectableList.vue';
import { pointViolet, gray } from '@/styles/colors';

interface Schedule {
    // eslint-disable-next-line camelcase
    schedule_id: string;
    name: string;
}

export const modes = ['READ', 'CREATE', 'UPDATE'];
export type Mode = typeof modes[number];

// eslint-disable-next-line camelcase
const defaultSchedule: Schedule = { name: '', schedule_id: '' };

const EXPECTED_STATES = {
    RUNNING: {
        label: 'Running',
        color: pointViolet,
    },
    STOPPED: {
        label: 'Stopped',
        color: gray[900],
    },
};

export default {
    name: 'PowerSchedulerDetail',
    components: {
        PSelectableList,
        PHr,
        VerticalPageLayout,
        PButtonModal,
        ScheduleDetail,
        PLottie,
        PIconButton,
        PIconTextButton,
        PPageTitle,
        PPageNavigation,
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
                { name: 'Automation', path: '/automation' },
                { name: 'Power Scheduler', path: '/automation/power-scheduler' },
                { name: `${projectName.value}`, path: `/automation/power-scheduler/${props.projectId}` },
            ]),
        });

        const state = reactive({
            scheduleList: [] as Schedule[],
            totalCount: 0,
            loading: true,
            selectedIndexes: [],
            selectedSchedule: computed(() => state.scheduleList[state.selectedIndexes[0]] || { ...defaultSchedule }),
            // eslint-disable-next-line camelcase
            mode: 'CREATE' as Mode,
            isFirstTimeCreate: computed(() => state.mode === 'CREATE' && state.totalCount === 0),
        });

        const formState = reactive({
            visible: false,
            headerTitle: computed(() => vm.$t('PWR_SCHED.CHECK_DELETE')),
            schedule_id: '',
        });

        const onClickCreate = () => {
            state.selectedIndexes = [];
            state.mode = 'CREATE';
        };

        const listSchedule = async () => {
            state.loading = true;
            try {
                const query = new QueryHelper().setFilter({ k: 'project_id', v: props.projectId, o: 'contain' });
                const res = await SpaceConnector.client.powerScheduler.schedule.list({ query: query.data });

                state.scheduleList = res.results;
                state.totalCount = res.total_count;

                if (state.totalCount === 0) {
                    onClickCreate();
                } else {
                    state.mode = 'READ';
                    state.selectedIndexes = [0];
                }
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };


        const showDetail = async (idx) => {
            if (state.mode === 'READ') {
                state.selectedIndexes = [idx];
            }
        };

        const onClickEdit = () => {
            state.mode = 'UPDATE';
        };

        const onClickDelete = () => {
            formState.schedule_id = state.selectedSchedule.schedule_id;
            formState.visible = true;
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

        const onCancel = () => {
            if (state.mode === 'CREATE') state.selectedIndexes = [0];
            state.mode = 'READ';
        };

        const onConfirm = () => {
            listSchedule();
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
            showDetail,
            onClickEdit,
            onClickDelete,
            scheduleDeleteConfirm,
            onClickCreate,
            onCancel,
            onConfirm,
            EXPECTED_STATES,
        };
    },
};
</script>

<style lang="postcss" scoped>
    header {
        @apply flex justify-between;
    }
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
        .item-state {
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

    .edit-tag {
        @apply bg-blue-200 text-secondary py-1 px-2 text-xs ml-2;
        border-radius: 2px;
    }
</style>
