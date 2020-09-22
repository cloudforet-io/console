<template>
    <div>
        <div v-if="!loading">
            <div v-for="(schedule, index) in scheduleList.scheduler" :key="index">
                <div class="scheduler-name" @click="showDetail(schedule)">
                    {{ schedule.name }}
                </div>
            </div>
        </div>
        <schedule-kanban v-if="selectedSchedule" :schedule-id="selectedSchedule.schedule_id"/>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    getCurrentInstance,
    reactive, toRefs,
} from '@vue/composition-api';

import { Timestamp } from '@/components/util/type';
import { SpaceConnector } from '@/lib/space-connector';
import ScheduleKanban from "@/views/management/power-scheduler/modules/ScheduleKanban.vue";

interface ScheduledResource {
    // eslint-disable-next-line camelcase
    managed_count: number;
    // eslint-disable-next-line camelcase
    total_count: number;
}
interface Scheduler {
    name: string;
    rule: object;
    // eslint-disable-next-line camelcase
    schedule_id: string;
}
interface CardItem {
    // eslint-disable-next-line camelcase
    created_at: Timestamp;
    // eslint-disable-next-line camelcase
    created_by: string;
    // eslint-disable-next-line camelcase
    deleted_at: unknown;
    domain_id: string;
    name: string;
    percentage: number;
    // eslint-disable-next-line camelcase
    project_id: string;
    // eslint-disable-next-line camelcase
    project_group_info: object;
    scheduler: Scheduler;
    scheduledResources: ScheduledResource;
    state: string;
    tags: object;
}

interface ResourceGroup {
    priority: number;
    // eslint-disable-next-line camelcase
    resource_group_id: string;
}

export default {
    name: 'PowerSchedulerDetail',
    components: {
        ScheduleKanban

    },
    props: {
        projectId: {
            type: String,
            default: undefined
        },
    },
    setup(props, context) {
        const state = reactive({
            scheduleList: [] as unknown as CardItem,
            resourceGroup: [] as unknown as ResourceGroup,
            resourceGroupId: [] as string [],
            loading: false,
            showDetailPanel: false,
            selectedSchedule: null,
        });

        const getScheduleList = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.powerSchedulerSchedules({ projects: [props.projectId] },
                    {
                        headers: {
                            'Mock-Mode': 'true',
                        },
                    });
                state.scheduleList.scheduler = res.projects[props.projectId];
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        const getResourceGroupName = async () => {
            for (let i = 0; i < Object.keys(state.resourceGroup).length; i++) {
                state.resourceGroupId[i] = state.resourceGroup[i].resource_group_id;
            }
            const res = await SpaceConnector.client.statistics.topic.powerSchedulerResourceGroups({
                // eslint-disable-next-line camelcase
                resource_groups: state.resourceGroupId,
            }, {
                headers: {
                    'Mock-Mode': 'true',
                },
            });
            for (let i = 0; i < Object.keys(state.resourceGroup).length; i++) {
                state.resourceGroup[i].name = res.resource_groups[state.resourceGroupId[i]].name;
                state.resourceGroup[i].count = res.resource_groups[state.resourceGroupId[i]].count;
            }
        };

        const getResourceGroup = async (scheduleId) => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.get({
                    // eslint-disable-next-line camelcase
                    schedule_id: scheduleId,
                }, {
                    headers: {
                        'Mock-Mode': 'true',
                    },
                });
                state.resourceGroup = res.resource_groups.map(d => ({
                    // eslint-disable-next-line camelcase
                    resource_group_id: d.resource_group_id,
                    priority: d.priority,
                }));
                await getResourceGroupName();
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        const showDetail = async (schedule) => {
            state.selectedSchedule = schedule;
        };

        const init = () => {
            getScheduleList();
        };

        init();

        return {
            ...toRefs(state),
            showDetail,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
