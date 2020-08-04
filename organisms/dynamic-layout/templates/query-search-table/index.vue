<template>
    <div class="p-dynamic-layout-query-search-table">
        <!--        <p-panel-top v-if="showTitle"-->
        <!--                     class="panel-top"-->
        <!--                     :use-total-count="true"-->
        <!--                     :total-count="totalCount"-->
        <!--        >-->
        <!--            {{ name }}-->
        <!--        </p-panel-top>-->
        <p-query-search-table :fields="fields"
                              :items="items"
                              :loading="loading"
                              :sort-by="sortBy"
                              :sort-desc="sortDesc"
                              :select-index="selectIndex"
                              :this-page="thisPage"
                              :page-size="pageSize"
                              :total-count="totalCount"
                              :key-items="keyItems"
                              :value-handler-map="valueHandlerMap"
                              :query-tags="queryTags"
                              @change="onChange"
                              v-on="$listeners"
        >
            <template v-for="(item, slotName) of dynamicFieldSlots" v-slot:[slotName]="data">
                <slot :name="slotName" v-bind="data">
                    <p-dynamic-field :key="item.name"
                                     v-bind="item"
                                     :data="data.value"
                    />
                </slot>
            </template>
        </p-query-search-table>
        <pre>
            {{ dynamicFieldSlots }}
        </pre>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { DynamicLayoutProps } from '@/components/organisms/dynamic-layout/type';
import { DataTableFieldType } from '@/components/organisms/tables/data-table/PDataTable.toolset';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { Options, QuerySearchTableProps } from '@/components/organisms/tables/query-search-table/type';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import { DynamicField, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { QuerySearchDynamicLayoutProps } from '@/components/organisms/dynamic-layout/templates/query-search-table/type';

const makeFields = (props: DynamicLayoutProps|any): DataTableFieldType[] => computed(() => {
    if (!props.options.fields) return [];

    return props.options.fields.map(ds => ({
        name: ds.key,
        label: ds.name,
        sortable: typeof ds.options?.sortable === 'boolean' ? ds.options.sortable : true,
        // eslint-disable-next-line camelcase
        sortKey: ds.options?.sort_key,
        width: ds.options?.width,
    }));
}) as unknown as DataTableFieldType[];


export default {
    name: 'PDynamicLayoutQuerySearchTable',
    components: {
        PDynamicField,
        PPanelTop,
        PQuerySearchTable,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        extra: {
            type: Object,
            default: () => ({
            }),
        },
        fetchHandler: {
            type: Function,
            // eslint-disable-next-line no-empty-function
            default: (fetchOptions) => {},
        },
        timezone: {
            type: String,
            default: undefined,
        },
    },
    setup(props: QuerySearchDynamicLayoutProps, { emit }) {
        const state: UnwrapRef<QuerySearchTableProps> = reactive({
            fields: makeFields(props),
            items: [],
            loading: false,
            sortBy: props.extra.sortBy || '',
            sortDesc: props.extra.sortDesc || true,
            selectIndex: props.extra.selectIndex || [],
            thisPage: props.extra.thisPage || 1,
            pageSize: props.extra.pageSize || 15,
            totalCount: props.extra.totalCount || 0,
            keyItems: props.extra.keyItems || [],
            valueHandlerMap: props.extra.valueHandlerMap || {},
            queryTags: props.extra.queryTags || [],
        });

        const onChange = async (options: Options) => {
            state.loading = true;
            try {
                state.items = await props.fetchHandler(options);
            } catch (e) {
                state.items = [];
            } finally {
                state.loading = false;
            }
        };

        const dynamicFieldSlots = computed((): Record<string, DynamicFieldProps> => {
            const res = {};
            if (!props.options.fields) return res;

            props.options.fields.forEach((ds: DynamicField, i) => {
                const item = { ...ds, extra: {} as any };

                if (ds.type === 'datetime') {
                    if (!item.extra.timezone) item.extra.timezone = props.timezone || 'UTC';
                }

                res[`col-${ds.key}-format`] = item;
            });

            return res;
        });

        return {
            ...toRefs(state),
            onChange,
            dynamicFieldSlots,
        };
    },
};
</script>

<style lang="postcss">
    .p-dynamic-layout-query-search-table {
        .panel-top {
            margin: 0.5rem 0 0;
        }
    }
</style>
