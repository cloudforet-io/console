<template>
    <div :class="{'edit-mode': mode === 'UPDATE'}" class="kanban">
        <div class="title-lap">
            <span class="title">리소스 그룹</span>
            <span class="sub-title">스케줄러를 적용할 리소스 그룹</span>
            <p-icon-text-button v-if="mode === 'UPDATE'" style-type="gray900" outline
                                name="ic_plus_bold"
                                class="add-column-btn mr-2 float-right" @click="addColumn"
            >
                우선순위 추가
            </p-icon-text-button>
        </div>
        <div v-if="loading">
            <p-skeleton class="skeleton-container" />
        </div>
        <transition-group v-if="!loading" class="kanban-container">
            <div
                v-for="column in columns"
                :key="column.title"
                class="resource-group-box"
            >
                <div class="resource-group-header">
                    <span id="header-number">{{ column.title }}</span>
                    <div v-if="column.title === '1'" class="header-decorator">
                        높음
                    </div>
                    <div v-if="column.title === maxPriority.length.toString()" class="header-decorator">
                        낮음
                    </div>
                    <span v-if="column.title === '1'" id="header-priority">우선순위</span>
                    <p-i v-if="column.title > 5 && editable" name="ic_delete" width="1.5rem"
                         color="transparent inherit"
                         class="header-button"
                         @click="deleteColumn(column.title, column)"
                    />
                </div>
                <div class="resource-item-wrapper">
                    <div v-if="editable && column.title === '1'" class="resource-group-item">
                        <div class="justify-center text-xs add-resource-group" @click="onClickResourceGroup()">
                            <p-i name="ic_plus_thin" width="0.875rem" class="mr-1" />그룹 추가
                        </div>
                    </div>
                    <div v-if="editable && column.title === '3' && !isDragging && column.items.length === 0" class="kanban-landing-wrapper">
                        <div id="kanban-landing-card" />
                        <div id="kanban-landing-square" />
                        <div id="kanban-landing-text" />
                        <p-i id="kanban-landing-icon" name="cursor_drag-arrow--blue" width="1.375rem" />
                        <p class="kanban-landing-text">
                            마우스로 리소스 그룹의 위치를 바꾸고<br> 우선 순위를 정하세요
                        </p>
                    </div>
                    <draggable :list="column.items" :animation="200" ghost-class="ghost-card"
                               group="items"
                               :empty-insert-threshold="100"
                               :disabled="!editable"
                               @start="onDraggingStart"
                               @end="onDraggingEnd"
                    >
                        <div v-for="(item, index) in column.items"
                             :key="`${item}-${index}`"
                             class="resource-group-item"
                             @click="onClickResourceGroup(item.resource_group)"
                        >
                            <div class="resource">
                                <p-lazy-img :src="iconUrl(item)"
                                            width="2rem" height="2rem"
                                            class="mr-2"
                                />
                                <span class="resource-description">
                                    {{ item.name }} <br> ({{ item.count }})
                                </span>
                                <p-i v-if="editable" name="ic_delete" width="1rem"
                                     color="transparent inherit" class="float-right"
                                     @click.stop="deleteResourceGroup(column, item, index)"
                                />
                            </div>
                        </div>
                    </draggable>
                </div>
            </div>
        </transition-group>
        <resource-group-page :visible.sync="resourceGroupVisible"
                             :resource-group="selectedResourceGroup"
        />
    </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import ResourceGroupPage from '@/views/management/power-scheduler/pages/ResourceGroupPage.vue';
import { ViewMode } from '@/views/management/power-scheduler/type';

    interface ItemType {
        // eslint-disable-next-line camelcase
        resource_group_id?: string;
        name?: string;
        count?: number;
        icon?: string;
    }

    interface ColumnType {
        title: string;
        items: ItemType[];
        options: {
            priority: number;
            badge?: string;
        };
    }

    interface Props {
        scheduleId: string;
        mode: ViewMode;
        projectId: string;
    }

export default {
    name: 'App',
    components: {
        ResourceGroupPage,
        PSkeleton,
        PIconTextButton,
        PI,
        PLazyImg,
        draggable,
    },
    props: {
        scheduleId: {
            type: String,
            required: true,
        },
        mode: {
            type: String,
            default: 'READ',
        },
        projectId: {
            type: String,
            required: true,
        },
    },
    setup(props: Props) {
        const state = reactive({
            columns: [] as unknown as ColumnType[],
            maxPriority: computed(() => state.columns.map(d => Math.max(d.options?.priority))),
            loading: false,
            editable: false,
            isDragging: false,
            resourceGroupVisible: false,
            selectedResourceGroup: null as any,
        });

        const addColumn = () => {
            state.columns.push({
                title: `${state.columns.length + 1}`,
                items: [],
                options: {
                    priority: state.columns.length + 1,
                    badge: 'Low',
                },
            });
        };

        const deleteColumn = (index, item) => {
            const deleteIndex = parseInt(index);
            if (state.columns[deleteIndex - 1] === undefined) state.columns.pop();
            state.columns.splice(deleteIndex - 1, 1);
            setTimeout(() => {
                for (let i = deleteIndex - 1; i < state.columns.length; i++) {
                    state.columns[i].title = `${parseInt(state.columns[i].title) - 1}`;
                }
            }, 100);
        };

        const getInitResourceGroup = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.getCreateScheduleResourceGroups({
                    // eslint-disable-next-line camelcase
                    project_id: props.projectId,
                });
                state.columns = res.columns;
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        const getResourceGroup = async (scheduleId) => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.getScheduleResourceGroups({
                    // eslint-disable-next-line camelcase
                    schedule_id: scheduleId,
                });
                if (res.columns.length < 5) {
                    while (res.columns.length < 5) {
                        res.columns.push({
                            title: `${res.columns.length + 1}`,
                            items: [],
                            options: {
                                priority: res.columns.length + 1,
                            },
                        });
                    }
                    state.columns = res.columns;
                } else {
                    state.columns = res.columns;
                }
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        const checkMode = () => {
            if (props.mode === 'UPDATE' || props.mode === 'CREATE') state.editable = true;
            else state.editable = false;
        };

        const deleteResourceGroup = (column, item, itemIndex) => {
            const columnIndex = parseInt(column.title) - 1;
            state.columns[columnIndex].items.splice(itemIndex, 1);
        };

        const onDraggingStart = () => {
            state.isDragging = true;
        };

        const onDraggingEnd = () => {
            state.isDragging = false;
        };

        const onSave = async (scheduleId) => {
            try {
                await SpaceConnector.client.powerScheduler.schedule.setScheduleResourceGroups({
                    schedule_id: scheduleId,
                    columns: state.columns,
                });
            } catch (e) {
                console.error(e);
            } finally {
                await getResourceGroup(scheduleId);
            }
        };

        const onClickResourceGroup = (item?) => {
            state.selectedResourceGroup = item || null;
            state.resourceGroupVisible = true;
        };


        watch([() => props.scheduleId, () => props.mode], async (after, before) => {
            if (props.scheduleId && (after !== before)) {
                await getResourceGroup(props.scheduleId);
                await checkMode();
            }
            if (!props.scheduleId && (after !== before)) {
                await getInitResourceGroup();
                await checkMode();
            }
        }, { immediate: true });


        return {
            ...toRefs(state),
            addColumn,
            deleteColumn,
            deleteResourceGroup,
            onDraggingStart,
            onDraggingEnd,
            onSave,
            iconUrl: (item): string => item.icon || store.state.resource.provider.items[item.provider]?.icon || '',
            onClickResourceGroup,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .title-lap {
        @apply w-full;
        margin-bottom: 1.5rem;
        .title {
            @apply text-gray-900;
            font-size: 1rem;
            font-weight: bold;
            padding-right: 0.5rem;
        }
        .sub-title {
            @apply text-gray-400;
            font-size: 0.75rem;
        }
    }
    .v-enter-active, .v-leave-active, .v-move {
        transition: all ease 0.5s;
    }
    .v-leave-active {
        position: relative;
    }
    .v-enter, .v-leave-to {
        opacity: 0;
        transform: translateY(20px);
    }
    .edit-mode {
        .kanban .kanban-container .resource-group-box .resource-group-header {
            @apply bg-blue-100;
        }
        .kanban .kanban-container .resource-group-box .resource-group-header .header-decorator {
            @apply bg-blue-200 text-blue-500;
        }
        .kanban .kanban-container .resource-group-box .resource-item-wrapper {
            height: 17rem;
        }
    }

    .kanban {
        .skeleton-container {
            max-width: calc(100vw - 4.5rem);
            height: 20rem;
        }
        .kanban-container {
            @apply flex flex-wrap w-full h-full;
            .resource-group-box {
                @apply border border-violet-200 bg-white box-border;
                width: calc(20% - 0.5rem);
                border-radius: 2px;
                margin-bottom: 0.5rem;
                box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06);
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
                    .header-button {
                        @apply float-right text-gray-300;
                        margin-right: 0.5rem;
                        margin-top: -0.2rem;
                    }
                }

                .resource-item-wrapper {
                    @apply overflow-y-auto overflow-x-hidden px-4 pb-4;
                    height: 13rem;
                    .kanban-landing-wrapper {
                        @apply flex-col;
                        #kanban-landing-card {
                            @apply bg-blue-500 m-auto;
                            height: 3.25rem;
                            opacity: 0.1;
                            margin-top: 30%;
                            border-radius: 0.25rem;
                            z-index: 1;
                        }
                        #kanban-landing-square {
                            @apply bg-blue-500;
                            opacity: 0.25;
                            border-radius: 0.25rem;
                            width: 2rem;
                            height: 2rem;
                            z-index: 2;
                            margin-top: -2.625rem;
                            margin-left: 0.625rem;
                        }
                        #kanban-landing-icon {
                            float: right;
                            z-index: 2;
                            margin-right: 0.25rem;
                            margin-top: -1.15rem;
                        }
                        .kanban-landing-text {
                            @apply text-center text-xs text-blue-500;
                            padding-top: 1rem;
                        }
                    }
                    .resource-group-item {
                        @apply w-full;
                        .add-resource-group {
                            @apply border border-dashed border-blue-300 flex items-center w-full content-between p-2 overflow-hidden leading-normal;
                            height: 3.25rem;
                            border-radius: 0.25rem;
                            margin-bottom: 0.5rem;
                            &:hover {
                                @apply border-blue-500 border border-solid bg-blue-100;
                            }
                            &:active {
                                @apply cursor-default bg-blue-200;
                            }
                        }
                        .resource {
                            @apply border border-dashed border-blue-300 flex items-center w-full content-between p-2 overflow-hidden leading-normal;
                            height: 3.25rem;
                            border-radius: 0.25rem;
                            margin-bottom: 0.5rem;
                            .resource-description {
                                flex-grow: 1;
                                font-size: 0.75rem;
                            }
                            &:hover {
                                @apply border-blue-500 border border-solid bg-blue-100;
                            }
                            &:active {
                                @apply cursor-move bg-blue-200;
                            }
                        }
                    }
                }
            }
            .resource-group-box + .resource-group-box {
                margin-right: 0.5rem;
            }
            .resource-group-box:nth-child(1) {
                margin-right: 0.5rem;
            }
        }
    }

</style>
