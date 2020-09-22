<template>
    <general-page-layout>
        <p-page-navigation :routes="routeState.route" />

        <div class="title-box">
            <p-page-title :title="projectName"
                          @goBack="$router.go(-1)"
            />
            <p-icon-text-button name="ic_plus_bold" style-type="primary-dark" size="sm">
                {{ $t('PWR_SCHED.CREATE') }}
            </p-icon-text-button>
        </div>

        <div class="list-box">
            <section v-if="isNoData">
                No Schedule List
            </section>
            <section v-else>
                <table>
                    <thead>
                        <tr>
                            <th>{{ $t('PWR_SCHED.LIST') }} ({{ totalCount }})</th>
                            <th>{{ $t('PWR_SCHED.EDIT') }}</th>
                            <th>{{ $t('PWR_SCHED.DELETE') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(schedule, index) in scheduleList" :key="index">
                            <td class="scheduler-name" @click="showDetail(schedule)">
                                {{ schedule.name }}
                            </td>
                            <td><p-i name="ic_edit" height="1rem" width="1rem" /></td>
                            <td><p-i name="ic_transhcan" height="1rem" width="1rem" /></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>

        <schedule-kanban v-if="selectedSchedule" :schedule-id="selectedSchedule.schedule_id" />
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { Timestamp } from '@/components/util/type';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import ScheduleKanban from '@/views/management/power-scheduler/modules/ScheduleKanban.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import { store } from '@/store';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PI from '@/components/atoms/icons/PI.vue';

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
        const projectName = computed(() => store.state.resource.project.items[props.projectId]?.label || props.projectId);

        /** Breadcrumb */
        const routeState = reactive({
            route: [
                { name: 'Management', path: '/management' },
                { name: 'Power Scheduler', path: '/management/power-scheduler' },
                { name: `${projectName.value}`, path: `/management/power-scheduler/${props.projectId}` },
            ],
        });

        const state = reactive({
            scheduleList: [] as Schedule[],
            totalCount: 0,
            resourceGroup: [] as unknown as ResourceGroup,
            resourceGroupId: [] as string [],
            loading: false,
            selectedSchedule: null,
            isNoData: computed(() => state.scheduleList.length === 0),
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
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };


        const showDetail = async (schedule) => {
            state.selectedSchedule = schedule;
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
        };
    },
};
</script>

<style lang="postcss" scoped>
    .title-box {
        @apply flex justify-between;
    }
    .list-box {
        margin-top: 2.25rem;
    }
    table {
        width: 100%;
        th, td {
            text-align: center;
            &:first-child {
                text-align: left;
            }
        }
    }
</style>
