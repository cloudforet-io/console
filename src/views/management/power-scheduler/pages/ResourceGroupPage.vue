<template>
    <general-page-layout v-if="visible" class="resource-group-page">
        <p-page-title :title="title" child @goBack="proxyVisible = false" />
        <p-pane-layout>
            <section>
                <div class="label">
                    {{ $t('PWR_SCHED.RESRC_GRP.BASE_INFO') }}
                </div>
                <div class="form">
                    <p-field-group v-if="isReadMode" :label="$t('PWR_SCHED.RESRC_GRP.NAME')" class="read-mode">
                        <span class="read-value">test</span>
                    </p-field-group>
                    <p-field-group v-else required :label="$t('PWR_SCHED.RESRC_GRP.NAME')">
                        <template #help>
                            {{ $t('PWR_SCHED.RESRC_GRP.NAME_DESC') }}
                            <span class="text-gray-500">{{ $t('PWR_SCHED.RESRC_GRP.NAME_DESC2') }}</span>
                        </template>
                        <p-text-input class="w-full" block
                                      :placeholder="$t('PWR_SCHED.RESRC_GRP.NAME')"
                        />
                    </p-field-group>

                    <div v-if="isReadMode" class="separator read-mode" />

                    <p-field-group v-if="isReadMode" :label="$t('PWR_SCHED.RESRC_GRP.TAG')">
                        <p-tag v-for="(v, k) in tags" :key="k" :deletable="false">
                            {{ k }}:{{ v }}
                        </p-tag>
                    </p-field-group>
                    <p-field-group v-else required :label="$t('PWR_SCHED.RESRC_GRP.TAG')">
                        <template #help>
                            {{ $t('PWR_SCHED.RESRC_GRP.TAG_DESC') }}
                            <br>
                            {{ $t('PWR_SCHED.RESRC_GRP.TAG_DESC2') }}
                        </template>
                        <p-dict-input-group ref="dictRef"
                                            :dict="tags"
                                            :show-validation="showValidation"
                        >
                            <template #addButton="scope">
                                <p-icon-text-button class="mt-4"
                                                    outline style-type="primary-dark" :disabled="scope.disabled"
                                                    name="ic_plus_bold"
                                                    @click="scope.addPair($event)"
                                >
                                    {{ $t('PWR_SCHED.RESRC_GRP.ADD_TAG') }}
                                </p-icon-text-button>
                            </template>
                        </p-dict-input-group>
                    </p-field-group>
                </div>
            </section>
            <div class="separator" />
            <section>
                <div class="label">
                    {{ $t('PWR_SCHED.RESRC_GRP.STANDARD') }}
                </div>
                <div class="form">
                    <p-field-group :label="$t('PWR_SCHED.RESRC_GRP.RESRC_TYPE_SELECT')">
                        <p-select-dropdown v-model="selectedTypeIndex"
                                           index-mode
                                           class="w-1/2"
                                           :items="RESOURCE_GROUP_TYPES"
                                           :placeholder="$t('PWR_SCHED.RESRC_GRP.RESRC_TYPE_DESC')"
                        />
                    </p-field-group>
                </div>
            </section>
            <div class="separator" />
            <section>
                <div class="label">
                    {{ $t('PWR_SCHED.RESRC_GRP.RESRC_LIST') }}
                    <span class="text-gray-500">({{ typeOptionState.totalCount }})</span>
                </div>
                <div class="table-form">
                    <p-field-group :label="$t('PWR_SCHED.RESRC_GRP.RESRC_SEARCH')" />
                    <p-dynamic-layout v-if="schema"
                                      type="query-search-table"
                                      :options="schema.options"
                                      :data="data"
                                      :type-options="typeOptionState"
                                      :fetch-options="fetchOptionState"
                                      :field-handler="fieldHandler"
                                      @init="listResources"
                                      @fetch="fetchTableData"
                                      @select="onSelect"
                    />
                </div>
            </section>
        </p-pane-layout>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */


import { Filter } from '@/lib/space-connector/type';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import {
    QuerySearchTableFetchOptions, QuerySearchTableListeners,
    QuerySearchTableTypeOptions,
} from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { forEach, camelCase } from 'lodash';
import { store } from '@/store';
import { getFiltersFromQueryTags } from '@/lib/component-utils/query-search-tags';
import { DynamicLayoutFieldHandler } from '@/components/organisms/dynamic-layout/type';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { QueryFilters } from '@/lib/type';
import PTag from '@/components/molecules/tags/PTag.vue';

interface Resource {
    resource_type: string;
    filter: Filter[];
}

interface ResourceGroup {
    resource_group_id?: string;
    name: string;
    resources: Resource;
    options: {
        raw_filter: QueryFilters;
    };
    tags: object;
}

interface Props {
    resourceGroup: null|ResourceGroup;
    visible: boolean;
}
const RESOURCE_GROUP_TYPES = [
    {
        label: '[ALL] Server',
        name: 'inventory.Server',
        type: 'item',
    },
    {
        label: '[AWS] RDS',
        name: 'inventory.CloudService?provider=aws&cloud_service_group=RDS&cloud_service_type=Database',
        type: 'item',
    },
    {
        label: '[AWS] Auto ScaliResourceGroupng Group',
        name: 'inventory.CloudService?provider=aws&cloud_service_group=AutoScaling&cloud_service_type=AutoScalingGroup',
        type: 'item',
    },
];


export default {
    name: 'ResourceGroupPage',
    components: {
        PTag,
        PDynamicLayout,
        PSelectDropdown,
        PIconTextButton,
        PDictInputGroup,
        PTextInput,
        PFieldGroup,
        PPaneLayout,
        PPageTitle,
        GeneralPageLayout,
    },
    props: {
        resourceGroup: {
            type: Object,
            default: null,
        },
        /* sync */
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const fetchOptionState: QuerySearchTableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [],
        });

        const typeOptionState: QuerySearchTableTypeOptions = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            keyItems: [],
            valueHandlerMap: {},
            colCopy: false,
        });

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            isReadMode: true,
            isCreateMode: computed(() => !props.resourceGroup || !props.resourceGroup.resource_group_id),
            title: computed(() => {
                if (props.resourceGroup) return props.resourceGroup.name;
                return vm.$t('PWR_SCHED.RESRC_GRP.CRT_NAME');
            }),
            selectedTypeIndex: -1,
            tags: {},
            showValidation: false,
            schema: null as any,
            data: null as any,
            currentResourceType: '',
            fixedFilters: [] as Filter[],
            dictRef: null as any,
        });

        const getPageSchema = async () => {
            state.schema = null;
            if (props.resourceGroup?.resources?.resource_type) {
                const resourceTypeSplit = props.resourceGroup.resources.resource_type?.split('?');
                state.currentResourceType = resourceTypeSplit[0];

                const options = {};
                const queryString = resourceTypeSplit[1];
                if (queryString) {
                    const optionsSplit = queryString?.split('&');
                    optionsSplit.forEach((d) => {
                        if (d) {
                            const str = d.split('=');
                            options[str[0]] = str[1];
                        }
                    });
                }

                try {
                    state.schema = await SpaceConnector.client.addOns.pageSchema.get({
                        resource_type: state.currentResourceType,
                        schema: 'table',
                        options,
                    });

                    const querySearchProps = makeQuerySearchPropsWithSearchSchema(
                        state.schema.options.search[0],
                        state.currentResourceType,
                    );
                    typeOptionState.keyItems = querySearchProps.keyItems;
                    typeOptionState.valueHandlerMap = querySearchProps.valueHandlerMap;

                    state.fixedFilters = [];
                    forEach(options, (d, k) => {
                        state.fixedFilters.push({
                            k, v: d, o: 'contain',
                        });
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        };

        const getQuery = () => {
            const { keywords, orFilters, andFilters } = getFiltersFromQueryTags(fetchOptionState.queryTags);

            const query = new QueryHelper();
            query.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilter(...andFilters)
                .setFilterOr(...orFilters)
                .setKeyword(...keywords);

            if (state.schema.options?.fields) {
                query.setOnly(...state.schema.options.fields.map((d) => {
                    if ((d.key as string).endsWith('.seconds')) return (d.key as string).replace('.seconds', '');
                    if (d.options?.root_path) return `${d.options.root_path}.${d.key}`;
                    return d.key;
                }));
            }

            return query.data;
        };

        const listResources = async () => {
            typeOptionState.loading = true;
            try {
                let api = SpaceConnector.client;
                state.currentResourceType.split('.').forEach((d) => {
                    api = api[camelCase(d)];
                });

                const res = await api.list({
                    query: getQuery(),
                });

                state.data = res.results;
                typeOptionState.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                state.data = [];
                typeOptionState.totalCount = 0;
            } finally {
                typeOptionState.loading = false;
            }
        };

        const onSelect: QuerySearchTableListeners['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
        };

        const fetchTableData: QuerySearchTableListeners['fetch'] = async (options, changed) => {
            if (changed.sortBy !== undefined) {
                fetchOptionState.sortBy = changed.sortBy;
                fetchOptionState.sortDesc = !!changed.sortDesc;
            }
            if (changed.pageLimit !== undefined) {
                fetchOptionState.pageLimit = changed.pageLimit;
            }
            if (changed.pageStart !== undefined) {
                fetchOptionState.pageStart = changed.pageStart;
            }
            if (changed.queryTags !== undefined) {
                fetchOptionState.queryTags = changed.queryTags;
            }

            await listResources();
        };

        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        watch([() => props.resourceGroup, () => state.selectedTypeIndex], async () => {
            if (props.resourceGroup || RESOURCE_GROUP_TYPES[state.selectedTypeIndex]) {
                await getPageSchema();
            }
            if (props.resourceGroup) {
                state.isReadMode = true;
                state.tags = props.resourceGroup.tags;
            } else {
                state.isReadMode = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            fetchOptionState,
            typeOptionState,
            RESOURCE_GROUP_TYPES,
            listResources,
            fetchTableData,
            fieldHandler,
            onSelect,
        };
    },
};
</script>

<style lang="postcss" scoped>
.resource-group-page {
    @apply bg-white fixed;
    z-index: 2;
    top: $gnb-height;
    left: 0;
    height: calc(100vh - ($gnb-height));
    width: 100vw;
}
.p-pane-layout {
    @apply pt-8 px-4;
}
section {
    @apply flex;
}
.label {
    @apply text-gray-900 flex-shrink-0;
    width: 13rem;
    font-size: 1rem;
    line-height: 1.2rem;
}
.form {
    @apply w-full;
    max-width: 43.5rem;
}
.table-form {
    @apply w-full overflow-hidden;
}
.p-dynamic-layout-query-search-table::v-deep .p-query-search-table.p-toolbox-table {
    height: 26.5rem;
    .toolbox {
        @apply px-0 pt-0;
    }
}
.p-field-group {
    width: 100%;
    &.read-mode::v-deep {
        @apply flex items-center;
        .form-label {
            @apply mb-0;
            width: 6.5rem;
            line-height: 1.3125rem;
        }
    }
    .read-value {
        font-size: 0.875rem;
        line-height: 1.3125rem;
    }
}
.p-dict-input-group::v-deep {
    .dict-group {
        @apply mt-6;
    }
}
.separator {
    @apply mt-4 mb-8 w-full border-b border-gray-200;
    &.read-mode {
        @apply my-6;
    }
}
</style>
