<template>
    <general-page-layout v-if="visible" class="resource-group-page">
        <p-page-title :title="title" child @goBack="proxyVisible = false">
            <template #extra>
                <!--                <p-icon-button class="ml-4 mr-2" name="ic_trashcan"></p-icon-button>-->
                <p-icon-button v-if="isReadMode" class="ml-4" name="ic_edit"
                               @click="isReadMode = false"
                />
            </template>
        </p-page-title>
        <p-pane-layout>
            <section>
                <div class="label">
                    {{ $t('PWR_SCHED.RESRC_GRP.BASE_INFO') }}
                </div>
                <div class="form">
                    <p-field-group v-if="isReadMode" :label="$t('PWR_SCHED.RESRC_GRP.NAME')" class="read-mode">
                        <span class="read-value">{{ name }}</span>
                    </p-field-group>
                    <p-field-group v-else required :label="$t('PWR_SCHED.RESRC_GRP.NAME')">
                        <template #help>
                            {{ $t('PWR_SCHED.RESRC_GRP.NAME_DESC') }}
                            <span class="text-gray-500">{{ $t('PWR_SCHED.RESRC_GRP.NAME_DESC2') }}</span>
                        </template>
                        <p-text-input v-model="name" class="w-full"
                                      block
                                      :class="{'is-invalid': showValidation && !validState.name}"
                                      :placeholder="$t('PWR_SCHED.RESRC_GRP.NAME')"
                                      @input="validateName"
                        />
                    </p-field-group>

                    <div v-if="isReadMode" class="separator read-mode" />

                    <p-field-group v-if="isReadMode" :label="$t('PWR_SCHED.RESRC_GRP.TAG')" class="read-mode">
                        <p-tag v-for="(v, k) in tags" :key="k" :deletable="false"
                               style-type="primary" outline
                        >
                            <strong>{{ k }}:</strong>&nbsp;{{ v }}
                        </p-tag>
                    </p-field-group>
                    <p-field-group v-else :label="$t('PWR_SCHED.RESRC_GRP.TAG')">
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
                    <p-field-group v-if="isReadMode" :label="$t('PWR_SCHED.RESRC_GRP.RESRC_TYPE')" class="read-mode">
                        <span class="read-value">{{ RESOURCE_GROUP_TYPES[selectedTypeIndex] ? RESOURCE_GROUP_TYPES[selectedTypeIndex].label : '' }}</span>
                    </p-field-group>
                    <p-field-group v-else required :label="$t('PWR_SCHED.RESRC_GRP.RESRC_TYPE_SELECT')">
                        <p-select-dropdown :select-item="selectedTypeIndex"
                                           index-mode
                                           class="w-1/2"
                                           :items="RESOURCE_GROUP_TYPES"
                                           :placeholder="$t('PWR_SCHED.RESRC_GRP.RESRC_TYPE_DESC')"
                                           :disabled="!isCreateMode"
                                           :invalid="showValidation && !validState.resourceType"
                                           @input="onSelectedTypeIndexChange"
                        />
                    </p-field-group>
                </div>
            </section>

            <template v-if="schema">
                <div class="separator" />
                <section>
                    <div class="label">
                        {{ $t('PWR_SCHED.RESRC_GRP.RESRC_LIST') }}
                        <span class="text-gray-500">({{ typeOptionState.totalCount }})</span>
                    </div>
                    <div class="table-form">
                        <p-field-group v-if="!isReadMode" required :label="$t('PWR_SCHED.RESRC_GRP.RESRC_SEARCH')" />
                        <p-dynamic-layout :type="isReadMode ? 'table' : 'query-search-table'"
                                          class="resource-table"
                                          :options="schema.options"
                                          :data="data"
                                          :type-options="typeOptionState"
                                          :fetch-options="fetchOptionState"
                                          :field-handler="fieldHandler"
                                          @init="listResources"
                                          @fetch="fetchTableData"
                        />
                    </div>
                </section>
            </template>
        </p-pane-layout>

        <div class="actions">
            <p-button style-type="gray900" :outline="true" @click="onClickCancel">
                {{ $t('PWR_SCHED.CANCEL') }}
            </p-button>
            <p-button v-if="!isReadMode" class="ml-4" style-type="secondary"
                      :disabled="showValidation && !validState.all"
                      @click="onClickSave"
            >
                {{ $t('PWR_SCHED.SAVE') }}
            </p-button>
        </div>
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
import { forEach, camelCase, findIndex } from 'lodash';
import { store } from '@/store';
import { getFiltersFromQueryTags, queryTagsToQueryFilters } from '@/lib/component-utils/query-search-tags';
import { DynamicLayoutFieldHandler } from '@/components/organisms/dynamic-layout/type';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { QueryFilters } from '@/lib/type';
import PTag from '@/components/molecules/tags/PTag.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import { TableTypeOptions } from '@/components/organisms/dynamic-layout/templates/table/type';

interface Resource {
    resource_type: string;
    filter: Filter[];
}

interface ResourceGroup {
    resource_group_id?: string;
    name: string;
    resources: Resource[];
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

// eslint-disable-next-line no-useless-escape
const nameRegex = new RegExp(/^[^\s\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"][^\{\}\[\]\/?.,;:|\)*~`!^\_+<>@\#$%&\\\=\(\'\"]{0,127}$/);


export default {
    name: 'ResourceGroupPage',
    components: {
        PIconButton,
        PButton,
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

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            isReadMode: true,
            isCreateMode: computed(() => !props.resourceGroup || !props.resourceGroup.resource_group_id),
            title: computed(() => {
                if (props.resourceGroup) return props.resourceGroup.name;
                return vm.$t('PWR_SCHED.RESRC_GRP.CRT_NAME');
            }),
            name: props.resourceGroup?.name || '',
            selectedTypeIndex: -1,
            selectedTypeName: computed(() => props.resourceGroup?.resources[0]?.resource_type
                || RESOURCE_GROUP_TYPES[state.selectedTypeIndex]?.name || ''),
            tags: {},
            showValidation: false,
            schema: null as any,
            data: null as any,
            currentApiResourceType: '',
            fixedFilters: [] as Filter[],
            dictRef: null as any,
        });


        const fetchOptionState: QuerySearchTableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [],
        });

        const typeOptionState: QuerySearchTableTypeOptions&TableTypeOptions = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: false,
            keyItems: [],
            valueHandlerMap: {},
            colCopy: false,
            searchable: computed(() => !state.isReadMode),
        });

        const validState = reactive({
            name: false,
            tags: false,
            resourceType: false,
            search: false,
            all: computed(() => validState.name && validState.tags && validState.resourceType && validState.search),
        });

        const getPageSchema = async () => {
            state.schema = null;
            const resourceTypeSplit = state.selectedTypeName.split('?');
            state.currentApiResourceType = resourceTypeSplit[0];

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
                    resource_type: state.currentApiResourceType,
                    schema: 'table',
                    options,
                });

                const querySearchProps = makeQuerySearchPropsWithSearchSchema(
                    state.schema.options.search[0],
                    state.currentApiResourceType,
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
                state.currentApiResourceType.split('.').forEach((d) => {
                    api = api[camelCase(d)];
                });

                const res = await api.list({
                    query: getQuery(),
                });

                state.data = res.results;
                typeOptionState.totalCount = res.total_count;
                validState.search = true;
            } catch (e) {
                console.error(e);
                state.data = null;
                typeOptionState.totalCount = 0;
                validState.search = false;
            } finally {
                typeOptionState.loading = false;
            }
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

        const reset = async () => {
            state.showValidation = false;
            state.tags = props.resourceGroup?.tags || {};
            state.selectedTypeIndex = findIndex(RESOURCE_GROUP_TYPES, { name: props.resourceGroup?.resources[0]?.resource_type });
            state.data = null;
            state.name = props.resourceGroup?.name || '';

            validState.name = false;
            validState.tags = false;
            validState.resourceType = false;
            validState.search = false;

            if (state.selectedTypeIndex === -1) state.schema = null;
            else await getPageSchema();
        };

        const onSelectedTypeIndexChange = async (idx) => {
            state.selectedTypeIndex = idx;
            validState.resourceType = idx !== -1;
            if (idx !== -1) await getPageSchema();
        };

        const onClickCancel = async () => {
            if (state.isReadMode || state.isCreateMode) state.proxyVisible = false;
            else {
                state.isReadMode = true;
                await reset();
            }
        };

        const validateName = (val) => {
            validState.name = nameRegex.test(val);
        };

        const validate = () => {
            validateName(state.name);
            validState.tags = state.dictRef.allValidation();
            validState.resourceType = !!RESOURCE_GROUP_TYPES[state.selectedTypeIndex];
            validState.search = state.data !== null;
            return validState.all;
        };


        const onClickSave = () => {
            state.showValidation = true;
            if (!validate()) return;

            const resource: Resource = {
                resource_type: state.selectedTypeName,
                filter: props.resourceGroup?.resources[0]?.filter || [],
            };
            const params: ResourceGroup = {
                name: state.name,
                resources: [resource],
                options: {
                    raw_filter: queryTagsToQueryFilters(fetchOptionState.queryTags),
                },
                tags: state.tags,
            };

            if (!state.isCreateMode) params.resource_group_id = props.resourceGroup?.resource_group_id;

            emit('confirm', params);
            state.proxyVisible = false;
        };

        watch([() => props.resourceGroup, () => props.visible], async ([group, visible]) => {
            if (!visible) return;

            if (group) {
                state.isReadMode = true;
            } else {
                state.isReadMode = false;
            }
            await reset();
        }, { immediate: true });


        return {
            ...toRefs(state),
            fetchOptionState,
            typeOptionState,
            validState,
            validateName,
            RESOURCE_GROUP_TYPES,
            listResources,
            fetchTableData,
            fieldHandler,
            onClickCancel,
            onClickSave,
            onSelectedTypeIndexChange,
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
.resource-table::v-deep .p-toolbox-table {
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
.actions {
    @apply mt-6 text-right;
}
</style>
