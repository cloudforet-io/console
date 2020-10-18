<template>
    <p-toolbox-grid-layout class="p-search-grid-layout"
                           :items="items"
                           :card-class="cardClass"
                           :card-min-width="cardMinWidth"
                           :card-height="cardHeight"
                           :pagination-values="paginationValues"
                           :excel-visible="false"
                           :loading="loading"
                           :all-page="allPage"
                           :this-page.sync="proxyState.thisPage"
                           :page-size.sync="proxyState.pageSize"
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
                                :class="{ 'mb-4': !!$scopedSlots['toolbox-bottom'] && proxyState.queryTags.length === 0}"
                                :key-items="keyItems"
                                :value-handler-map="valueHandlerMap"
                                @search="onSearch"
                />
                <div :class="{ 'mb-4': $scopedSlots['toolbox-bottom']}">
                    <p-query-search-tags ref="tagsRef"
                                         :tags="proxyState.queryTags"
                                         @change="onQueryTagsChange"
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
import {
    QuerySearchTagsFunctions,
    QuerySearchTagsListeners,
    QueryTag,
} from '@/components/organisms/search/query-search-tags/type';
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
            default: undefined,
        },
        pageSize: {
            type: Number,
            default: undefined,
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
            default: undefined,
        },
        paginationValues: {
            type: Array,
            default: () => [24, 36, 48],
        },
    },
    setup(props: QuerySearchTableProps, { slots, emit, listeners }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const localState = reactive({
            thisPage: props.thisPage === undefined ? 1 : props.thisPage,
            pageSize: props.pageSize === undefined ? 24 : props.pageSize,
            queryTags: props.queryTags === undefined ? [] : props.queryTags,
        });

        const proxyState = reactive({
            thisPage: makeOptionalProxy<number>('thisPage', vm, localState),
            pageSize: makeOptionalProxy<number>('pageSize', vm, localState),
            queryTags: makeOptionalProxy<QueryTag[]>('queryTags', vm, localState),
        });

        const state = reactive({
            allPage: computed(() => Math.ceil(props.totalCount / proxyState.pageSize) || 1),
            tagsRef: null as null|QuerySearchTagsFunctions,
            /** others */
            options: computed(() => ({
                thisPage: proxyState.thisPage,
                pageSize: proxyState.pageSize,
                queryTags: proxyState.queryTags,
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
        const emitChange = (options: Partial<Options> = {}) => {
            if (options?.queryTags || proxyState.thisPage > proxyState.pageSize) {
                options.thisPage = 1;
                proxyState.thisPage = 1;
            }
            emit('change', Object.freeze({
                ...state.options,
                ...options,
            }), Object.freeze({ ...options }));
        };

        const onChangePageSize = (pageSize: number) => {
            if (proxyState.thisPage > (Math.ceil(props.totalCount / pageSize) || 1)) {
                proxyState.thisPage = 1;
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
        const onSearch = async (query: QueryItem) => {
            if (!state.tagsRef) return;
            state.tagsRef.addTag(query);
        };

        const onQueryTagsChange: QuerySearchTagsListeners['change'] = (tags: QueryTag[]) => {
            proxyState.queryTags = tags;
            emitChange({ queryTags: tags });
        };

        return {
            proxyState,
            ...toRefs(state),
            emitChange,
            onChangePageSize,
            onChangePageNumber,
            onSearch,
            onQueryTagsChange,
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
