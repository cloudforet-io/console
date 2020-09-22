<template>
    <div>
        <div v-if="!loading" class="flex">
            <div class="mr-2 border border-gray first">
                1
                <div v-for="(resource, index) in resourceGroup" :key="index">
                    <div v-if="resource.priority === 1">
                        {{ resource.name }} {{ resource.count }}
                    </div>
                </div>
            </div>
            <div class="mr-2 border border-gray second">
                2
                <div v-for="(resource, index) in resourceGroup" :key="index">
                    <div v-if="resource.priority === 2">
                        {{ resource.name }} {{ resource.count }}
                    </div>
                </div>
            </div>
            <div class="mr-2 border border-gray third">
                3
                <div v-for="(resource, index) in resourceGroup" :key="index">
                    <div v-if="resource.priority === 3">
                        {{ resource.name }} {{ resource.count }}
                    </div>
                </div>
            </div>
            <div class="mr-2 border border-gray fourth">
                4
                <div v-for="(resource, index) in resourceGroup" :key="index">
                    <div v-if="resource.priority === 4">
                        {{ resource.name }} {{ resource.count }}
                    </div>
                </div>
            </div>
            <div class="mr-2 border border-gray fifth">
                5
                <div v-for="(resource, index) in resourceGroup" :key="index">
                    <div v-if="resource.priority === 5">
                        {{ resource.name }} {{ resource.count }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">


import { Timestamp } from '@/components/util/type';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';

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
    name: 'ScheduleKanban',
    props: {
        scheduleId: {
            type: String,
            required: true,
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            resourceGroup: [] as unknown as ResourceGroup,
            resourceGroupId: [] as string [],
            loading: false,
        });


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


        watch(() => props.scheduleId, async (after, before) => {
            if (after !== before) {
                await getResourceGroup(props.scheduleId);
            }
        }, { immediate: true });


        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
