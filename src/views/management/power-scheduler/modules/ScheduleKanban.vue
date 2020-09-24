<template>
    <div v-if="!loading" class="kanban">
        <div v-for="(num, priority) in maxPriority" :key="priority">
            <div class="resource-group-box">
                <div class="resource-group-header">
                    <span id="header-number">{{ num }}</span>
                    <div v-if="num === 1" class="header-decorator">
                        높음
                    </div>
                    <span v-if="num === 1" id="header-priority">우선순</span>
                    <div v-if="num ===5" class="header-decorator">
                        낮음
                    </div>
                </div>
                <div v-for="(resource, idx) in resourceGroup" :key="idx" class="resource-group-item">
                    <div v-if=" resource.priority === num" class="resource">
                        <p-lazy-img :src="iconUrl(resource)"
                                    width="2rem" height="2rem"
                                    class="mr-2"
                        />
                        <span class="resource-description">
                            {{ resource.name }} <br> ({{ resource.count }})
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs, watch } from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';


    interface ResourceGroup {
        priority: number;
        // eslint-disable-next-line camelcase
        resource_group_id: string;
    }

    interface CardItem {
        count: number;
        icon: string;
        priority: number;
        name: string;
        // eslint-disable-next-line camelcase
        resource_group_id: string;
    }

export default {
    name: 'ScheduleKanban',
    components: { PLazyImg },
    props: {
        scheduleId: {
            type: String,
            required: true,
        },
        mode: {
            type: String,
            default: 'READ',
        },
    },
    setup(props, context) {
        const state = reactive({
            resourceGroup: [] as unknown as ResourceGroup,
            resourceGroupId: [] as string [],
            loading: false,
            maxPriority: 0,
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
                state.resourceGroup[i].icon = res.resource_groups[state.resourceGroupId[i]].icon;
            }
        };

        const getPriority = async () => {
            const priorityList = [] as any;
            for (let i = 0; i < Object.keys(state.resourceGroup).length; i++) {
                priorityList[i] = state.resourceGroup[i].priority;
            }
            state.maxPriority = Math.max(...priorityList);
            if (state.maxPriority < 5) state.maxPriority = 5;
        };

        const getResourceGroup = async (scheduleId) => {
            state.loading = true;
            state.resourceGroupId = [];
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

                await getPriority();
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
            iconUrl: (item): string => item.icon || store.state.resource.provider.items[item.provider]?.icon || '',
        };
    },
};
</script>

<style lang="postcss" scoped>
    .kanban {
        @apply flex flex-wrap;
        width: 100%;
        .resource-group-box {
            @apply border border-violet-200 bg-white;
            border-radius: 2px;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            width: 13.75rem;
            height: 20.75rem;
            .resource-group-header {
                @apply bg-violet-100;
                height: 2.5rem;
                padding-top: 0.75rem;
                padding-bottom: 0.625rem;
                margin-bottom: 1rem;

                #header-number {
                    @apply text-gray-700 font-bold;
                    padding-left: 1rem;
                    font-size: 0.875rem;
                }

                .header-decorator {
                    @apply inline-block bg-primary3 text-primary;
                    border-radius: 2px;
                    width: 2.4375rem;
                    height: 1.25rem;
                    margin-left: 0.5rem;
                    font-size: 0.75rem;
                    line-height: 1.5;
                    text-align: center;
                }

                #header-priority {
                    @apply float-right text-gray-700;
                    padding-right: 1rem;
                    font-size: 0.75rem;
                    line-height: 1.5;
                }
            }

            .resource-group-item {
                @apply px-4 overflow-auto;
                .resource {
                    @apply border border-dashed border-primary2 flex items-center w-full content-between p-2 overflow-hidden leading-normal;
                    width: 11.75rem;
                    height: 3.25rem;
                    margin-bottom: 0.5rem;

                    .resource-description {
                        font-size: 0.75rem;
                    }
                }
            }
        }
    }
</style>
