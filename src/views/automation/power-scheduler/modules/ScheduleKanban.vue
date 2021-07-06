<template>
    <div :class="{'edit-mode': isEditMode }" class="kanban">
        <div class="title-wrapper">
            <span class="title">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.RESOURCE_GROUP_TITLE') }}</span>
            <span class="sub-title">{{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.RESOURCE_GROUP_DESC') }}</span>
            <p-icon-text-button v-if="isEditMode || isCreateMode" style-type="gray900" outline
                                name="ic_plus_bold"
                                class="add-column-btn float-right" @click="addColumn"
            >
                {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.ADD_PRIORITY') }}
            </p-icon-text-button>
            <p-button v-if="!isEditMode && !isCreateMode"
                      style-type="gray900 outline"
                      class="edit-btn" @click="startEdit"
            >
                {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.EDIT') }}
            </p-button>
        </div>
        <transition-group class="kanban-container">
            <div
                v-for="(column, columnIdx) in columns"
                :key="column.title"
                class="resource-group-box"
                @click="hideGuide"
            >
                <div class="resource-group-header">
                    <span id="header-number">{{ column.title }}</span>
                    <div v-if="column.title === '1'" class="header-decorator">
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.HIGH') }}
                    </div>
                    <div v-if="column.title === maxPriority.length.toString()" class="header-decorator">
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.LOW') }}
                    </div>
                    <!--                    <span v-if="column.title === '1'" id="header-priority">-->
                    <!--                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.PRIORITY') }}-->
                    <!--                    </span>-->
                    <p-i v-if="column.title > 5 && (isCreateMode || isEditMode)" name="ic_delete" width="1.5rem"
                         color="inherit"
                         class="header-button"
                         @click="deleteColumn(column.title, column)"
                    />
                </div>
                <div class="resource-item-wrapper">
                    <div v-if="(isCreateMode || isEditMode) && column.title === '1'" class="resource-group-item">
                        <div class="add-resource-group" @click="onClickResourceGroup()">
                            <p-i name="ic_plus_thin" width="0.875rem" class="mr-1" />
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.ADD_RESOURCE_GROUP') }}
                        </div>
                    </div>
                    <div v-if="column.title === '3' && showGuide" class="kanban-guide-wrapper">
                        <div id="kanban-guide-card" />
                        <div id="kanban-guide-square" />
                        <div id="kanban-guide-text" />
                        <p-i id="kanban-guide-icon" name="cursor_drag-arrow--blue" width="1.375rem" />
                        <p class="kanban-guide-text">
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.KANBAN_HINT_TEXT_1') }}
                            <br>
                            {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.KANBAN_HINT_TEXT_2') }}
                        </p>
                    </div>
                    <draggable :list="column.items" :animation="200" ghost-class="ghost-card"
                               group="items"
                               :empty-insert-threshold="30"
                               :disabled="!(isCreateMode || isEditMode)"
                               class="list-group"
                    >
                        <div v-for="(item, index) in column.items"
                             :key="`${columnIdx}-${index}`"
                             :class="{'recommended': item.recommended }"
                             class="resource-group-item"
                             @click="onClickResourceGroup(index, columnIdx)"
                        >
                            <div class="resource">
                                <p-lazy-img :src="iconUrl(item)"
                                            width="2rem" height="2rem"
                                            class="resource-image"
                                />
                                <div class="resource-description">
                                    <p class="resource-name">
                                        {{ item.name }}
                                    </p><span class="resource-count">({{ item.count }})</span>
                                </div>
                                <p-icon-button v-if="(isCreateMode || isEditMode) && !item.recommended" name="ic_delete" width="1rem"
                                               color="inherit"
                                               class="float-right -mr-1"
                                               @click.stop="deleteResourceGroup(column, item, index)"
                                />
                                <p v-if="isCreateMode && item.recommended" class="recommended-text">
                                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.RECOMMENDED') }}
                                </p>
                                <p-button v-if="isCreateMode && item.recommended"
                                          style-type="secondary" size="sm" class="add-btn"
                                >
                                    {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.ADD') }}
                                </p-button>
                            </div>
                        </div>
                    </draggable>
                </div>
            </div>
        </transition-group>
        <div v-if="isEditMode" class="actions">
            <p-button style-type="gray900" :outline="true" @click="finishEdit">
                {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CANCEL') }}
            </p-button>
            <p-button class="ml-4" style-type=" secondary"
                      @click="onSave(scheduleId)"
            >
                {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SAVE') }}
            </p-button>
        </div>
        <router-view v-if="!isCreateMode && !isEditMode" />
        <resource-group-page :visible="resourceGroupVisible"
                             :resource-group="selectedItem ? selectedItem.resource_group : null"
                             :project-id="projectId"
                             :read-mode="mode === 'READ' && !isEditMode"
                             @confirm="onResourceGroupConfirm"
                             @cancel="hideResourceGroupPage"
        />
    </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PI, PIconTextButton, PLazyImg, PButton, PIconButton,
} from '@spaceone/design-system';

import ResourceGroupPage from '@/views/automation/power-scheduler/pages/ResourceGroupPage.vue';
import { KanbanItem, ViewMode, ResourceGroupItem } from '@/views/automation/power-scheduler/type';
import { SpaceConnector } from '@/core-lib/space-connector';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { store } from '@/store';
import { AUTOMATION_ROUTE } from '@/routes/automation/automation-route';

interface ColumnType {
    title: string;
    items: KanbanItem[];
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
    name: 'ScheduleKanban',
    components: {
        ResourceGroupPage,
        PIconButton,
        PButton,
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
    setup(props: Props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            columns: [] as unknown as ColumnType[],
            maxPriority: computed(() => state.columns.map(d => Math.max(d.options?.priority))),
            loading: false,
            isEditMode: false,
            isCreateMode: computed(() => props.mode === 'CREATE'),
            showGuide: false,
            isHovered: false,
            resourceGroupVisible: false,
            selectedResourceGroupIndex: -1,
            selectedItem: computed(() => state.columns[state.selectedColumnIndex]?.items[state.selectedResourceGroupIndex] || null),
            selectedColumnIndex: 0,
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
            state.showGuide = true;
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
            state.showGuide = false;
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

        const startEdit = () => {
            state.isEditMode = true;
            vm.$emit('edit-start');
        };

        const finishEdit = async () => {
            state.isEditMode = false;
            await getResourceGroup(props.scheduleId);
            vm.$emit('edit-finish');
        };

        const deleteResourceGroup = (column, item, itemIndex) => {
            const columnIndex = parseInt(column.title) - 1;
            state.columns[columnIndex].items.splice(itemIndex, 1);
        };

        const onSave = async (scheduleId) => {
            try {
                await SpaceConnector.client.powerScheduler.schedule.setScheduleResourceGroups({
                    schedule_id: scheduleId,
                    columns: state.columns,
                });

                if (props.mode !== 'CREATE') {
                    showSuccessMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_S_EDIT_RESOURCE_GROUP'), '', root);
                }
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.DETAILS.ALT_E_EDIT_RESOURCE_GROUP'), e, root);
            } finally {
                state.isEditMode = false;
            }
            vm.$emit('edit-finish');
        };

        const hideResourceGroupPage = async () => {
            state.selectedResourceGroupIndex = -1;
            state.selectedColumnIndex = 0;
            state.resourceGroupVisible = false;
        };

        const showResourceGroupPage = () => {
            if (state.isCreateMode || state.isEditMode) {
                state.resourceGroupVisible = true;
            } else {
                if (!state.selectedItem?.resource_group.resource_group_id) return;
                vm.$router.push({
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.RESOURCE_GROUP._NAME,
                    params: {
                        projectId: props.projectId,
                        scheduleId: props.scheduleId,
                        resourceGroupId: state.selectedItem?.resource_group.resource_group_id,
                    },
                });
            }
        };


        const onClickResourceGroup = (index = -1, columnIdx = 0) => {
            state.selectedResourceGroupIndex = index;
            state.selectedColumnIndex = columnIdx;
            showResourceGroupPage();
        };

        const onResourceGroupConfirm = (resourceGroupItem: ResourceGroupItem) => {
            // update case
            if (state.selectedItem) {
                state.columns[state.selectedColumnIndex].items[state.selectedResourceGroupIndex] = {
                    icon: state.selectedItem.icon,
                    ...resourceGroupItem,
                };
                state.columns = [...state.columns];
            } else {
                state.columns[0].items.push({
                    icon: '',
                    ...resourceGroupItem,
                });
                state.columns = [...state.columns];
            }

            hideResourceGroupPage();
        };

        const hideGuide = () => {
            state.showGuide = false;
        };


        watch(() => props.scheduleId, async (after, before) => {
            if (props.scheduleId && (after !== before)) {
                await getResourceGroup(props.scheduleId);
            }
            if (!props.scheduleId && (after !== before)) {
                await getInitResourceGroup();
            }
        }, { immediate: true });


        return {
            ...toRefs(state),
            addColumn,
            deleteColumn,
            startEdit,
            finishEdit,
            deleteResourceGroup,
            onSave,
            iconUrl: (item): string => assetUrlConverter(item.icon) || store.state.resource.provider.items[item.provider]?.icon || '',
            onClickResourceGroup,
            onResourceGroupConfirm,
            hideGuide,
            hideResourceGroupPage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title-wrapper {
    @apply w-full;
    margin-bottom: 1.5rem;
    .title {
        @apply text-gray-900;
        font-size: 1.125rem;
        font-weight: bold;
        padding-right: 0.5rem;
    }
    .sub-title {
        @apply text-gray-400;
        font-size: 0.75rem;
    }
    .edit-btn {
        @apply float-right cursor-pointer;
        font-size: 0.875rem;
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

.kanban {
    .kanban-container {
        @apply grid w-full h-full;
        row-gap: 0.5rem;
        column-gap: 0.5rem;
        grid-template-columns: repeat(auto-fit, minmax(11.75rem, 1fr));
        .resource-group-box {
            @apply border border-violet-200 bg-white box-border;
            border-radius: 2px;
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
                    padding: 0.2rem 0.5rem;
                    margin-left: 0.5rem;
                    font-size: 0.75rem;
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
                .list-group {
                    height: calc(100% - 5.7rem);
                }
                .kanban-guide-wrapper {
                    @apply flex-col;
                    #kanban-guide-card {
                        @apply bg-blue-100 m-auto;
                        height: 3.25rem;
                        border-radius: 0.25rem;
                        z-index: 1;
                    }
                    #kanban-guide-square {
                        @apply bg-blue-300;
                        opacity: 0.4;
                        border-radius: 0.25rem;
                        width: 2rem;
                        height: 2rem;
                        z-index: 2;
                        margin-top: -2.625rem;
                        margin-left: 0.625rem;
                    }
                    #kanban-guide-icon {
                        float: right;
                        z-index: 2;
                        margin-right: 0.25rem;
                        margin-top: -1.15rem;
                    }
                    .kanban-guide-text {
                        @apply text-center text-xs text-blue-500;
                        padding-top: 1rem;
                    }
                }
                .resource-group-item {
                    @apply w-full block;
                    .add-resource-group {
                        @apply border border-dashed border-gray-200 flex items-center w-full justify-center text-xs cursor-pointer content-between p-2 overflow-hidden leading-normal;
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
                        @apply border border-gray-300 flex items-center w-full content-between p-2 overflow-hidden leading-normal whitespace-no-wrap;
                        height: 3.25rem;
                        border-radius: 0.25rem;
                        margin-bottom: 0.5rem;
                        line-height: 1.5;
                        position: relative;
                        cursor: pointer;
                        &:hover {
                            @apply border-blue-500 border border-solid bg-blue-100;
                            .add-btn {
                                display: inline;
                                position: absolute;
                                right: 0.5rem;
                                line-height: 1.8;
                            }
                        }
                        &:active {
                            @apply cursor-move bg-blue-200;
                        }
                        .resource-description {
                            @apply ml-2;
                            flex-grow: 1;
                            overflow-x: hidden;
                            font-size: 0.75rem;
                        }
                        .resource-image {
                            flex-shrink: 0;
                        }
                        .resource-name {
                            @apply truncate w-full;
                        }
                        .add-btn {
                            display: none;
                        }
                    }

                    &.recommended {
                        .resource {
                            @apply border border-dashed border-gray-300;
                        }
                        .resource-image {
                            opacity: 0.5;
                        }
                        .recommended-text {
                            @apply text-blue-500;
                            opacity: 0.5;
                            font-size: 0.75rem;
                            flex-shrink: 0;
                            margin-right: 0.5rem;
                        }
                        .resource-description {
                            .resource-name, .resource-count {
                                opacity: 0.5;
                            }
                        }
                    }
                }
            }
        }
    }
    &.edit-mode {
        .kanban-container .resource-group-box .resource-group-header {
            @apply bg-blue-100;
        }
        .kanban-container .resource-group-box .resource-group-header .header-decorator {
            @apply bg-blue-200 text-blue-500;
        }
        .kanban-container .resource-group-box .resource-item-wrapper {
            height: 17rem;
        }
    }
}
.actions {
    @apply flex justify-end;
    margin-top: 1.5rem;
}
.p-button.gray900 {
    @apply border-gray-300;
    &:hover {
        @apply border-gray-900;
    }
}
</style>
