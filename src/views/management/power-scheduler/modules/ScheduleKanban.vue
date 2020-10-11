<template>
    <div class="kanban">
        <div class="title-lap">
            <span class="title">리소스 그룹</span>
            <span class="sub-title">스케줄러를 적용할 리소스 그룹</span>
        </div>
        <p-icon-text-button v-if="mode === 'UPDATE'" style-type="primary-dark" outline name="ic_plus_bold"
                            @click="addColumn" class="add-column-btn float-right"
        >
            우선순위 추가
        </p-icon-text-button>
        <transition-group class="container">
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
                    <span v-if="column.title === '1'" id="header-priority">우선순</span>
                    <p-i v-if="column.title > 5" name="ic_delete" width="1.5rem"
                         color="transparent inherit"
                         class="header-button"
                         @click="deleteColumn(column.title, column)"
                    />
                </div>
                <div class="resource-item-wrapper">
                    <draggable :list="column.items" :animation="200" ghost-class="ghost-card"
                               group="tasks"
                               :empty-insert-threshold="100"
                    >
                        <div
                            v-for="(item) in column.items"
                            :key="item.resource_group_id"
                            class="resource-group-item"
                        >
                            <div class="resource">
                                <p-lazy-img :src="iconUrl(item)"
                                            width="2rem" height="2rem"
                                            class="mr-2"
                                />
                                <span class="resource-description">
                                    {{ item.name }} <br> ({{ item.count }})
                                </span>
                            </div>
                        </div>
                    </draggable>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
import { reactive, toRefs, watch } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';

export default {
    name: 'App',
    components: {
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
    },
    setup(props, context) {
        const state = reactive({
            columns: [] as any,
            loading: false,
        });

        const addColumn = () => {
            state.columns.push({
                title: `${state.columns.length + 1}`,
                items: [],
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

        const getResourceGroup = async (scheduleId) => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.powerScheduler.schedule.getScheduleResourceGroups({
                    // eslint-disable-next-line camelcase
                    schedule_id: scheduleId,
                }, {
                    headers: {
                        'Mock-Mode': 'true',
                    },
                });
                if (res.columns.length < 5) {
                    while (res.columns.length < 5) {
                        res.columns.push({
                            title: `${res.columns.length + 1}`,
                            items: [],
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

        watch(() => props.scheduleId, async (after, before) => {
            if (after !== before) {
                await getResourceGroup(props.scheduleId);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            addColumn,
            deleteColumn,
            iconUrl: (item): string => item.icon || store.state.resource.provider.items[item.provider]?.icon || '',
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
    .v-enter-active, .v-move {
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
        width: 100%;
        .container {
            @apply flex flex-wrap w-full h-full;
            .resource-group-box {
                @apply border border-violet-200 bg-white;
                border-radius: 2px;
                margin-right: 0.5rem;
                margin-bottom: 0.5rem;
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
                    @apply overflow-y-auto overflow-x-hidden;
                    height: 20.75rem;
                    width: 13.8rem;
                }

                .resource-group-item {
                    @apply mx-4;
                    .resource {
                        @apply border border-dashed border-blue-300 flex items-center w-full content-between p-2 overflow-hidden leading-normal;
                        width: 11.75rem;
                        height: 3.25rem;
                        border-radius: 0.25rem;
                        margin-bottom: 0.5rem;

                        .resource-description {
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
    }
</style>
