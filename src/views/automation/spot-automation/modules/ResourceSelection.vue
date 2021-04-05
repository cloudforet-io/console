<template>
    <div>
        <p-field-group required class="field-group">
            <template #label>
                <span class="label">{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CLOUD_SERVICE.SERVICE_CATEGORY_LABEL') }}</span>
            </template>
            <section class="resource-type-list">
                <div v-for="(item, i) in supportedResourceTypeItems" :key="i" class="resource-type-wrapper"
                     :class="{selected: item.name === selectedResourceTypeItem.name}"
                     @click="onSelectResourceType(i)"
                >
                    <p-radio :selected="item.name === selectedResourceTypeItem.name" :value="true" class="radio"
                             @click.stop="onSelectResourceType(i)"
                    >
                        <template #icon>
                            <p-i v-if="item.name === selectedResourceTypeItem.name"
                                 name="ic_checkbox_circle--checked"
                            />
                        </template>
                    </p-radio>
                    <div class="resource-type">
                        <p-lazy-img :src="item.data.icon" />
                        <br>
                        <span class="name">{{ item.label }}</span>
                    </div>
                </div>
            </section>
        </p-field-group>

        <p-field-group required class="field-group" :invalid="typeOptionState.invalid"
                       :invalid-text="$t('AUTOMATION.SPOT_AUTOMATION.ADD.CLOUD_SERVICE.RESOURCE_REQUIRED')"
        >
            <template #label>
                <span class="label">{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CLOUD_SERVICE.RESOURCE_LABEL') }}</span>
            </template>

            <div v-if="schema">
                <p-dynamic-layout type="query-search-table"
                                  class="resource-table"
                                  :options="schema.options"
                                  :data="data"
                                  :type-options="typeOptionState"
                                  :fetch-options="fetchOptionState"
                                  :field-handler="fieldHandler"
                                  @fetch="onFetchTable"
                                  @select="onSelectTable"
                />
            </div>
        </p-field-group>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { camelCase, forEach, map } from 'lodash';
import {
    PDynamicLayout, PFieldGroup, PI, PLazyImg, PRadio,
} from '@spaceone/design-system';
import {
    QuerySearchTableFetchOptions, QuerySearchTableListeners,
    QuerySearchTableTypeOptions,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/templates/query-search-table/type';
import { store } from '@/store';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { QueryHelper } from '@/lib/query';
import { DynamicLayoutFieldHandler } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { SpaceConnector } from '@/lib/space-connector';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';

interface SupportResourceGroupTypes {
    [resourceType: string]: {
        name: string;
        // eslint-disable-next-line camelcase
        recommended_title: string;
        icon: string;
    };
}
interface SelectedResourceTypeItem {
    label: string;
    name: string;
    type: 'item';
    data: {
        resourceType?: string;
        options: object;
        icon?: string;
    };
}

interface Props {
    showValidation: boolean;
}

export default {
    name: 'ResourceSelection',
    components: {
        PDynamicLayout,
        PFieldGroup,
        PRadio,
        PI,
        PLazyImg,
    },
    props: {
        showValidation: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const typeOptionState = reactive<QuerySearchTableTypeOptions>({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            multiSelect: false,
            keyItemSets: [],
            valueHandlerMap: {},
            colCopy: false,
            searchable: true,
            excelVisible: false,
            // eslint-disable-next-line no-use-before-define
            invalid: computed<boolean>(() => state.showSelectValidation && !state.selectedResource),
        });

        const fetchOptionState = reactive<QuerySearchTableFetchOptions>({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [],
        });

        const state = reactive({
            showSelectValidation: props.showValidation,
            supportedResourceTypes: {} as SupportResourceGroupTypes,
            supportedResourceTypeItems: computed<SelectedResourceTypeItem[]>(() => map(state.supportedResourceTypes, (d, k) => {
                const options: any = {};
                const queryString = k.split('?')[1] || '';
                if (queryString) {
                    const optionsSplit = queryString?.split('&');
                    optionsSplit.forEach((op) => {
                        if (op) {
                            const str = op.split('=');
                            options[str[0]] = str[1];
                        }
                    });
                }

                const res: SelectedResourceTypeItem = {
                    label: d.name,
                    name: k,
                    type: 'item',
                    data: {
                        options,
                        resourceType: k.split('?')[0],
                        icon: d.icon,
                    },
                };

                return res;
            })),
            selectedResourceTypeIndex: 0,
            selectedResourceTypeItem: computed<SelectedResourceTypeItem|null>(() => state.supportedResourceTypeItems[state.selectedResourceTypeIndex] || null),
            schema: null as any,
            data: null as any,
            selectedResource: null as any,
        });

        const apiQuery = new ApiQueryHelper();
        const tableQueryHelper = new QueryHelper();
        const extraQueryHelper = new QueryHelper();

        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };


        const listResources = async () => {
            if (!state.selectedResourceTypeItem.data) return;

            typeOptionState.loading = true;
            try {
                let api = SpaceConnector.client;
                state.selectedResourceTypeItem.data.resourceType.split('.').forEach((d) => {
                    api = api[camelCase(d)];
                });

                apiQuery.setFilters(tableQueryHelper.filters)
                    .addFilter(...extraQueryHelper.filters);

                const res = await api.list({
                    query: apiQuery.data,
                });

                state.data = res.results;
                typeOptionState.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                state.data = null;
                typeOptionState.totalCount = 0;
            } finally {
                typeOptionState.loading = false;
            }
        };

        const onFetchTable: QuerySearchTableListeners['init'|'fetch'] = async (options, _changed?) => {
            const changed = _changed || options;

            if (changed.sortBy !== undefined) {
                fetchOptionState.sortBy = changed.sortBy;
                fetchOptionState.sortDesc = !!changed.sortDesc;
                apiQuery.setSort(changed.sortBy, changed.sortDesc);
            }
            if (changed.pageLimit !== undefined) {
                fetchOptionState.pageLimit = changed.pageLimit;
                apiQuery.setPageLimit(changed.pageLimit);
            }
            if (changed.pageStart !== undefined) {
                fetchOptionState.pageStart = changed.pageStart;
                apiQuery.setPageStart(changed.pageStart);
            }
            if (changed.queryTags !== undefined) {
                fetchOptionState.queryTags = changed.queryTags;
                tableQueryHelper.setFiltersAsQueryTag(changed.queryTags);
            }

            await listResources();
        };

        const onSelectTable = (selectIdx) => {
            if (!state.showSelectValidation) state.showSelectValidation = true;
            if (!Array.isArray(state.data)) state.selectedResource = null;
            else state.selectedResource = state.data[selectIdx[0]] || null;

            emit('change', {
                resource: state.selectedResource,
                resourceType: state.selectedResourceTypeItem?.data.resourceType,
            },
            !typeOptionState.invalid);
        };

        const onSelectResourceType = (i) => {
            state.selectedResourceTypeIndex = i;
            typeOptionState.selectIndex = [];
            onSelectTable(typeOptionState.selectIndex);
        };

        const getSupportedResourceTypes = async () => {
            try {
                state.supportedResourceTypes = await SpaceConnector.client.spotAutomation.spotGroup.getSupportedResourceTypes();
            } catch (e) {
                console.error(e);
                state.supportedResourceTypes = {};
                state.schema = null;
                typeOptionState.selectIndex = [];
            }
        };

        const getSchemaOptions = () => {
            extraQueryHelper.setFilters([]);
            const options = state.selectedResourceTypeItem?.data.options || {};
            forEach(options, (d, k) => {
                extraQueryHelper.addFilter({ k, v: d, o: '=' });
            });

            return options;
        };

        const getPageSchema = async () => {
            if (!state.selectedResourceTypeItem) return;

            try {
                state.schema = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: state.selectedResourceTypeItem.data.resourceType,
                    schema: 'table',
                    options: getSchemaOptions(),
                });

                if (!state.schema) return;

                const querySearchProps = makeQuerySearchPropsWithSearchSchema(
                    state.schema.options.search,
                    state.selectedResourceTypeItem.data.resourceType,
                );
                typeOptionState.keyItemSets = querySearchProps.keyItemSets;
                typeOptionState.valueHandlerMap = querySearchProps.valueHandlerMap;

                if (state.schema.options?.fields) {
                    apiQuery.setOnly(...state.schema.options.fields.map((d) => {
                        if ((d.key as string).endsWith('.seconds')) return (d.key as string).replace('.seconds', '');
                        if (d.options?.root_path) return `${d.options.root_path}.${d.key}`;
                        return d.key;
                    }), 'cloud_service_id', 'cloud_service_type');
                }
            } catch (e) {
                console.error(e);
                state.schema = null;
                typeOptionState.selectIndex = [];
            }
        };

        watch(() => props.showValidation, (showValidation) => {
            state.showSelectValidation = showValidation;
        });

        /* Init */
        (async () => {
            await getSupportedResourceTypes();

            watch(() => state.selectedResourceTypeItem, async (item) => {
                if (item) {
                    await getPageSchema();
                    await onFetchTable(fetchOptionState);
                }
            }, { immediate: true });
        })();


        return {
            ...toRefs(state),
            typeOptionState,
            fetchOptionState,
            fieldHandler,
            onFetchTable,
            onSelectTable,
            onSelectResourceType,
        };
    },
};
</script>

<style lang="postcss" scoped>
.field-group {
    margin-bottom: 0;
    &:first-child {
        margin-bottom: 1.75rem;
    }
}
.label {
    font-weight: normal;
    font-size: 18px;
    line-height: 155%;
    margin-bottom: 0.5rem;
}
.resource-type-list {
    display: grid;
    row-gap: 0.5rem;
    column-gap: 0.5rem;
    grid-template-columns: repeat(auto-fit, 16.5rem);
}
.resource-type-wrapper {
    @apply bg-white border-gray-200 text-gray-900;
    position: relative;
    border-width: 1px;
    border-radius: 4px;
    min-width: 7.375rem;
    max-width: 16.5rem;
    padding: 2rem 0.5rem;
    cursor: pointer;
    &.selected {
        @apply border-secondary text-secondary;
    }
    &:hover {
        @apply bg-secondary2;
    }
    .radio {
        @apply absolute;
        left: 0.75rem;
        top: 0.75rem;
    }
    .resource-type {
        @apply flex flex-col items-center justify-center;
    }
    .name {
        color: inherit;
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 1.2;
    }
}
.resource-table::v-deep .p-query-search-table.p-toolbox-table .toolbox {
    padding-left: 0;
    padding-right: 0;
    padding-top: 0;
}
</style>
