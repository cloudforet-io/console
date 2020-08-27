<template>
    <p-toolbox-grid-layout class="p-search-grid-layout"
                           :items="items"
                           :card-class="cardClass"
                           :card-min-width="cardMinWidth"
                           :card-height="cardHeight"
                           :excel-visible="false"
                           :loading="loading"
                           :all-page="allPage"
                           :this-page.sync="proxyThisPage"
                           :page-size.sync="proxyPageSize"
                           @changePageSize="onChangePageSize"
                           @changePageNumber="onChangePageNumber"
                           @clickRefresh="refresh"
    >
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex flex-col flex-1">
                <p-query-search class="block lg:hidden mb-6"
                                :class="{ 'mb-4': !!$scopedSlots['toolbox-bottom'] && tags.length === 0}"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
                <div v-if="tags.length > 0" :class="{ 'mb-4': $scopedSlots['toolbox-bottom']}">
                    <p-query-search-tags
                        :tags="tags"
                        @delete:tag="deleteTag"
                        @delete:all="deleteAllTags"
                    />
                </div>
                <slot name="toolbox-bottom" />
            </div>
        </template>
        <template v-for="name in slotNames" v-slot:[name]="data">
            <slot :name="name" v-bind="data" />
        </template>
    </p-toolbox-grid-layout>
</template>

<script lang="ts">
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { forEach } from 'lodash';
import { QueryItem } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { Options, QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';

export default {
    name: 'PSearchGridLayout',
    components: {
        PToolboxGridLayout,
        PQuerySearchTags,
        PQuerySearch,
    },
    props: {
        items: {
            type: Array,
            default: () => ([]),
            required: true,
        },
        cardClass: {
            type: Function,
            default: () => ['card-item'],
        },
        cardMinWidth: {
            type: String,
            default: '20rem',
        },
        cardHeight: {
            type: String,
            default: '6rem',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        thisPage: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 24,
        },
        totalCount: {
            type: Number,
            default: 0,
            required: true,
        },
        keyItems: {
            type: Array,
            default: () => [],
        },
        valueHandlerMap: {
            type: Object,
            default: () => ({}),
        },
        queryTags: {
            type: Array,
            default: () => [],
        },
    },
    setup(props: QuerySearchTableProps, { slots, emit, listeners }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            allPage: computed(() => Math.ceil(props.totalCount / props.pageSize) || 1),
            proxyThisPage: makeOptionalProxy('thisPage', vm),
            proxyPageSize: makeOptionalProxy('pageSize', vm),
            /** search */
            tags: makeOptionalProxy('queryTags', vm),
            /** others */
            options: computed(() => ({
                thisPage: state.proxyThisPage,
                pageSize: state.proxyPageSize,
                queryTags: state.tags,
            })),
            slotNames: computed(() => {
                const res: string[] = [];
                forEach(slots, (func, name) => {
                    if (!['toolbox-left', 'toolbox-bottom'].includes(name)) res.push(name);
                });
                return res;
            }),
        });

        /** Event emitter */
        const emitChange = (options?: Partial<Options>) => {
            emit('change', Object.freeze({
                ...state.options,
                ...options,
            }), Object.freeze({ ...options }));
        };

        watch(() => props.totalCount, async (after, before) => {
            if (before !== after) {
                state.proxyThisPage = 1;
                // emitChange({ thisPage: 1 });
            }
        }, { immediate: true });

        const onChangePageSize = (pageSize: number) => {
            if (props.thisPage > (Math.ceil(props.totalCount / pageSize) || 1)) {
                state.proxyThisPage = 1;
                emitChange({ pageSize, thisPage: 1 });
            } else emitChange({ pageSize });
        };

        const onChangePageNumber = (thisPage: number) => {
            emitChange({ thisPage });
        };

        const refresh = () => {
            emit('refresh');
        };

        /** Search event listeners */
        const validation = (query: QueryItem): boolean => (state.tags as unknown as QueryTag[]).every((tag) => {
            if (tag.key && query.key) {
                return (query.key.name !== tag.key.name
                        || query.operator !== tag.operator
                        || query.value !== tag.value);
            }
            if (!tag.key && !query.key) {
                return query.value !== tag.value;
            }
            return true;
        });

        const deleteTag = (idx: number) => {
            state.tags.splice(idx, 1);
            emitChange({ queryTags: state.tags });
        };

        const deleteAllTags = () => {
            state.tags = [];
            emitChange({ queryTags: state.tags });
        };

        const onSearch = async (query: QueryItem) => {
            if (!validation(query)) return;
            // TODO: convert queryItem to queryTag with datatype
            // @ts-ignore
            state.tags = [...state.tags, query];
            emitChange({ queryTags: state.tags });
        };

        return {
            ...toRefs(state),
            deleteTag,
            deleteAllTags,
            emitChange,
            onChangePageSize,
            onChangePageNumber,
            onSearch,
            refresh,
        };
    },
};
</script>

<style lang="postcss">
    .p-search-grid-layout {
        .left-toolbox-item {
            &:last-child {
                flex-grow: 1;
            }
        }
        >>> .toolbox {
            .toolbox-bottom {
                @apply mt-0;
            }
        }
    }
</style>
