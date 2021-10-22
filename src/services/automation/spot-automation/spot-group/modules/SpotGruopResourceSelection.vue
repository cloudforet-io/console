<template>
    <spot-group-add-section>
        <template #title>
            <info-message :message="$t('AUTOMATION.SPOT_AUTOMATION.ADD.RESOURCE.RESOURCE_DESC') " />
        </template>
        <div v-if="selectedResource" class="select-item">
            <strong>Name</strong>: {{ selectedResource.data.auto_scaling_group_name }}
        </div>
        <p-field-group required class="field-group" :invalid="typeOptionState.invalid"
                       :invalid-text="$t('AUTOMATION.SPOT_AUTOMATION.ADD.RESOURCE.RESOURCE_REQUIRED')"
        >
            <template v-if="schema">
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
            </template>
        </p-field-group>
    </spot-group-add-section>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { camelCase, forEach } from 'lodash';
import {
    PDynamicLayout, PFieldGroup,
} from '@spaceone/design-system';
import { store } from '@/store';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-util/dynamic-layout';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { SpotGroupResourceCategory } from '@/services/automation/spot-automation/type';
import SpotGroupAddSection from '@/services/automation/spot-automation/spot-group/components/SpotGroupAddSection.vue';
import InfoMessage from '@/common/components/guidance/InfoMessage.vue';


interface Props {
    projectId?: string;
    category?: SpotGroupResourceCategory|null;
}

export default {
    name: 'SpotGroupResourceSelection',
    components: {
        InfoMessage,
        SpotGroupAddSection,
        PDynamicLayout,
        PFieldGroup,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        category: {
            type: Object,
            default: null,
        },
    },
    setup(props: Props, { emit }) {
        const typeOptionState = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            multiSelect: false,
            keyItemSets: [] as KeyItemSet[],
            valueHandlerMap: {} as ValueHandlerMap,
            colCopy: false,
            searchable: true,
            excelVisible: false,
            // eslint-disable-next-line no-use-before-define
            invalid: computed<boolean>(() => state.showSelectValidation && !state.selectedResource),
        });

        const fetchOptionState = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [] as QueryTag[],
        });

        const state = reactive({
            showSelectValidation: false,
            schema: null as any,
            data: null as any,
            selectedResource: null as any,
            occupiedResources: [] as any[],
        });

        const apiQuery = new ApiQueryHelper();
        const tableQueryHelper = new QueryHelper();
        const schemaOptionsQueryHelper = new QueryHelper();
        const excludeResourceQueryHelper = new QueryHelper();

        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };


        const listResources = async () => {
            if (!props.category?.resourceType) return;

            typeOptionState.loading = true;
            try {
                let api = SpaceConnector.client;
                props.category.resourceType.split('.').forEach((d) => {
                    api = api[camelCase(d)];
                });

                apiQuery.setFilters(tableQueryHelper.filters)
                    .addFilter(...schemaOptionsQueryHelper.filters)
                    .addFilter(...excludeResourceQueryHelper.filters);

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

        const onFetchTable: DynamicLayoutEventListener['fetch'] = async (changed) => {
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

        const changeSelect = (selectIdx) => {
            if (!Array.isArray(state.data)) state.selectedResource = null;
            else state.selectedResource = state.data[selectIdx[0]] || null;

            emit('change', {
                resource: state.selectedResource,
                resourceType: props.category?.resourceType,
            },
            !typeOptionState.invalid);
        };

        const onSelectTable = (selectIdx) => {
            if (!state.showSelectValidation) state.showSelectValidation = true;
            typeOptionState.selectIndex = selectIdx;
            changeSelect(selectIdx);
        };


        const getSchemaOptions = () => {
            schemaOptionsQueryHelper.setFilters([]);
            const options = props.category?.options || {};
            forEach(options, (d, k) => {
                schemaOptionsQueryHelper.addFilter({ k, v: d, o: '=' });
            });

            return options;
        };

        const getPageSchema = async () => {
            if (!props.category?.resourceType) return;

            try {
                state.schema = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: props.category.resourceType,
                    schema: 'table',
                    options: getSchemaOptions(),
                });

                if (!state.schema) return;

                const querySearchProps = makeQuerySearchPropsWithSearchSchema(
                    state.schema.options.search,
                    props.category.resourceType,
                );
                typeOptionState.keyItemSets = querySearchProps.keyItemSets;
                typeOptionState.valueHandlerMap = querySearchProps.valueHandlerMap;

                if (state.schema.options?.fields) {
                    apiQuery.setOnly(...state.schema.options.fields.map((d) => {
                        if (d.options?.root_path) return `${d.options.root_path}.${d.key}`;
                        return d.key;
                    }), 'cloud_service_id', 'cloud_service_type', 'reference');
                }
            } catch (e) {
                console.error(e);
                state.schema = null;
                typeOptionState.selectIndex = [];
            }
        };

        const getOccupiedResourceList = async () => {
            try {
                const { results } = await SpaceConnector.client.spotAutomation.spotGroup.getSpotGroupResources();
                state.occupiedResources = results.map(d => d.cloud_service_id);
                if (state.occupiedResources.length > 0) {
                    excludeResourceQueryHelper.setFilters([{
                        k: 'cloud_service_id',
                        v: state.occupiedResources,
                        o: '!=',
                    }]);
                } else { excludeResourceQueryHelper.setFilters([]); }
            } catch (e) {
                state.occupiedResources = [];
            }
        };

        /* Init */
        (async () => {
            await Promise.all([getOccupiedResourceList(), store.dispatch('resource/loadAll', true)]);


            // set project tag
            if (props.projectId) {
                fetchOptionState.queryTags.push({
                    key: { name: 'project_id', label: 'Project' },
                    operator: '=',
                    value: { name: props.projectId, label: store.state.resource.project.items[props.projectId]?.label || props.projectId },
                } as unknown as QueryTag);
            }

            watch(() => props.category, async (after, before) => {
                if (after !== before) {
                    typeOptionState.selectIndex = [];
                    changeSelect(typeOptionState.selectIndex);
                }
                if (after) {
                    await getPageSchema();
                    await onFetchTable(fetchOptionState);
                } else {
                    state.schema = null;
                    typeOptionState.selectIndex = [];
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
        };
    },
};
</script>

<style lang="postcss" scoped>
.select-item {
    @apply border border-secondary text-secondary rounded-md;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.4;
    width: fit-content;
    margin: 1.125rem 0 1.5rem;
}
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
.resource-table::v-deep .p-toolbox-table .p-toolbox {
    padding-left: 0;
    padding-right: 0;
    padding-top: 0.25rem;
}
</style>
