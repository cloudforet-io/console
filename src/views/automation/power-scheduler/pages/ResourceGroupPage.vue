<template>
    <div>
        <transition name="slide-up">
            <general-page-layout v-show="visible === undefined || visible">
                <p-page-title :title="title" child @goBack="onClickCancel" />
                <p-pane-layout>
                    <section>
                        <div class="label">
                            {{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.BASE_INFO_TITLE') }}
                        </div>
                        <div class="form">
                            <p-field-group v-if="readMode" :label="$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.NAME')" class="read-mode">
                                <span class="read-value">{{ name }}</span>
                            </p-field-group>
                            <p-field-group v-else required :label="$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.NAME')"
                                           :invalid="validState.showValidation && !validState.name"
                                           :invalid-text="validState.nameInvalidMsg"
                            >
                                <template #help>
                                    {{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.NAME_DESC_1') }}
                                    <span class="text-gray-500">
                                        {{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.NAME_DESC_2') }}
                                    </span>
                                </template>
                                <p-text-input v-model="name" class="w-full"
                                              block
                                              :invalid="validState.showValidation && !validState.name"
                                              :placeholder="$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.NAME')"
                                              @input="validateName"
                                />
                            </p-field-group>
                        </div>
                    </section>
                    <div class="separator" />
                    <section>
                        <div class="label">
                            {{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.STANDARD') }}
                        </div>
                        <div class="form">
                            <p-field-group v-if="readMode" :label="$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.RESOURCE_TYPE')" class="read-mode">
                                <span class="read-value">{{ supportResourceGroupTypeItems[selectedTypeIndex] ? supportResourceGroupTypeItems[selectedTypeIndex].label : '' }}</span>
                            </p-field-group>
                            <p-field-group v-else required :label="$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.RESOURCE_TYPE_SELECT')">
                                <p-select-dropdown :selected="selectedTypeIndex"
                                                   index-mode
                                                   class="w-1/2"
                                                   :items="supportResourceGroupTypeItems"
                                                   :disabled="resourceTypeReadOnly"
                                                   :invalid="validState.showValidation && !validState.resourceType"
                                                   @select="onSelectedTypeIndexChange"
                                >
                                    {{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.RESOURCE_TYPE_DESC') }}
                                </p-select-dropdown>
                            </p-field-group>
                        </div>
                    </section>

                    <template v-if="schema">
                        <div class="separator" />
                        <section>
                            <div class="label">
                                {{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.RESOURCE_LIST') }}
                                <span class="text-gray-500">({{ typeOptionState.totalCount }})</span>
                            </div>
                            <div class="table-form">
                                <p-field-group v-if="!readMode" :label="$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.RESOURCE_SEARCH')" />
                                <p-query-search-tags v-if="readMode" read-only :tags="fetchOptionState.queryTags"
                                                     :timezone="typeOptionState.timezone"
                                />
                                <p-dynamic-layout type="query-search-table"
                                                  class="resource-table"
                                                  :options="schema.options"
                                                  :data="data"
                                                  :type-options="typeOptionState"
                                                  :fetch-options="fetchOptionState"
                                                  :field-handler="fieldHandler"
                                                  @fetch="onFetchTable"
                                >
                                    <template #no-data-format>
                                        <span :class="{
                                            'text-alert': validState.showValidation
                                        }"
                                        >{{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.RESOURCE_SEARCH_INVALID') }}</span>
                                    </template>
                                </p-dynamic-layout>
                            </div>
                        </section>
                    </template>
                </p-pane-layout>

                <div class="actions">
                    <p-button style-type="gray900" :outline="true" @click.stop="onClickCancel">
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.CANCEL') }}
                    </p-button>
                    <p-button v-if="!readMode" class="ml-4" style-type="secondary"
                              :disabled="validState.showValidation && !validState.all"
                              @click.stop="onClickSave"
                    >
                        {{ $t('AUTOMATION.POWER_SCHEDULER.DETAILS.SAVE') }}
                    </p-button>
                </div>
            </general-page-layout>
        </transition>
        <p-table-check-modal theme-color="primary"
                             size="lg"
                             :header-title="listModalState.headerTitle"
                             :visible.sync="listModalState.visible"
                             @confirm="onListModalConfirm"
        >
            <template #sub-title-format>
                <p class="check-title">
                    {{ $t('AUTOMATION.POWER_SCHEDULER.RESOURCE.CHECK_LIST_MODAL_DESC') }} <span class="count">({{ typeOptionState.totalCount }})</span>
                </p>
            </template>
            <p-query-search-tags read-only :tags="fetchOptionState.queryTags"
                                 :timezone="typeOptionState.timezone"
            />
            <p-dynamic-layout v-if="schema"
                              type="query-search-table"
                              class="resource-table modal-table"
                              :options="schema.options"
                              :data="data"
                              :type-options="{
                                  ...typeOptionState, searchable: false
                              }"
                              :fetch-options="fetchOptionState"
                              :field-handler="fieldHandler"
                              @fetch="onFetchTable"
            />
        </p-table-check-modal>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PPageTitle, PPaneLayout, PFieldGroup, PTextInput, PSelectDropdown,
    PButton, PQuerySearchTags, PTableCheckModal, PDynamicLayout,
} from '@spaceone/design-system';
import {
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';

import { makeProxy } from '@/core-lib/compostion-util';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import { SpaceConnector } from '@/core-lib/space-connector';
import { ApiQueryHelper } from '@/core-lib/space-connector/helper';
import { makeQuerySearchPropsWithSearchSchema } from '@/core-lib/component-util/dynamic-layout';
import {
    forEach, camelCase, findIndex, map,
} from 'lodash';
import { store } from '@/store';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { showErrorMessage } from '@/core-lib/helper/notice-alert-helper';
import { QueryHelper } from '@/core-lib/query';

import { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import { ResourceGroup, Resource, ResourceGroupItem } from '@/views/automation/power-scheduler/type';
import { AUTOMATION_ROUTE } from '@/routes/automation/automation-route';
import router from '@/routes';


interface Props {
    projectId: string;
    resourceGroup: null|ResourceGroup;
    visible?: boolean;
    readMode: boolean;
    resourceGroupId?: string;
    scheduleId?: string;
}


interface SupportResourceGroupTypes {
  [resourceType: string]: {
    name: string;
    recommended_title: string;
  };
}

// eslint-disable-next-line no-useless-escape
const nameRegex = new RegExp(/^[^\s\d\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"][^\{\}\[\]\/?.,;:|\)*~`!^\_+<>@\#$%&\\\=\(\'\"]{0,127}$/);


export default {
    name: 'ResourceGroupPage',
    components: {
        PTableCheckModal,
        PQuerySearchTags,
        PButton,
        PDynamicLayout,
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        PPaneLayout,
        PPageTitle,
        GeneralPageLayout,
    },
    props: {
        // props only
        resourceGroup: {
            type: Object,
            default: null,
        },
        // props only, sync
        visible: {
            type: Boolean,
            default: undefined,
        },
        // props only
        readMode: {
            type: Boolean,
            default: true,
        },
        // both props and route params
        projectId: {
            type: String,
            required: true,
        },
        // route param
        resourceGroupId: {
            type: String,
            default: undefined,
        },
        // route param
        scheduleId: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const apiQuery = new ApiQueryHelper();
        const tableQueryHelper = new QueryHelper();
        const extraQueryHelper = new QueryHelper();

        /* reactive variables */
        const formState = reactive({
            resourceGroup: null as ResourceGroup|null,
        });

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            resourceTypeReadOnly: computed(() => !!formState.resourceGroup),
            title: computed(() => formState.resourceGroup?.name || vm.$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.TITLE')),

            name: '',
            selectedTypeIndex: -1,
            tags: {},
            resource: { filter: [], keyword: '', resource_type: '' } as Resource,

            schema: null as any,
            data: null as any,
            supportResourceGroupTypes: {} as SupportResourceGroupTypes,
            supportResourceGroupTypeItems: computed(() => map(state.supportResourceGroupTypes, (d, k) => ({
                label: d.name,
                name: k,
                type: 'item',
            }))),
        });

        const fetchOptionState = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [] as QueryTag[],
        });

        const typeOptionState = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: false,
            multiSelect: true,
            keyItemSets: [] as KeyItemSet[],
            valueHandlerMap: {} as ValueHandlerMap,
            colCopy: false,
            searchable: computed(() => !props.readMode),
            excelVisible: false,
        });

        const validState = reactive({
            showValidation: false,
            name: false,
            resourceType: false,
            resources: false,
            all: computed(() => validState.name && validState.resourceType && validState.resources),
            nameInvalidMsg: '',
        });

        const listModalState = reactive({
            headerTitle: computed(() => vm.$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.CHECK_LIST_MODAL_TITLE')),
            visible: false,
        });

        /* validations */
        const validateName = (val) => {
            validState.name = nameRegex.test(val);
            if (validState.name) validState.nameInvalidMsg = '';
            else if (state.name.trim().length === 0) validState.nameInvalidMsg = vm.$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.NAME_REQUIRED');
            else validState.nameInvalidMsg = vm.$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.NAME_INVALID');
        };

        const validateResourceType = () => {
            validState.resourceType = !!state.supportResourceGroupTypeItems[state.selectedTypeIndex];
        };

        const validateResources = () => {
            validState.resources = typeOptionState.totalCount !== 0;
        };

        const validate = () => {
            validateName(state.name);
            validateResourceType();
            validateResources();
            return validState.all;
        };


        /* table */
        const getSchemaOptions = () => {
            const queryString = state.resource.resource_type.split('?')[1] || '';
            const options = {};
            if (queryString) {
                const optionsSplit = queryString?.split('&');
                optionsSplit.forEach((d) => {
                    if (d) {
                        const str = d.split('=');
                        options[str[0]] = str[1];
                    }
                });
            }

            extraQueryHelper.setFilters([]);
            forEach(options, (d, k) => {
                extraQueryHelper.addFilter({ k, v: d, o: '=' });
            });

            return options;
        };

        const getPageSchema = async () => {
            const resourceType = state.resource.resource_type.split('?')[0];
            try {
                state.schema = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: resourceType,
                    schema: 'table',
                    options: getSchemaOptions(),
                });

                const querySearchProps = makeQuerySearchPropsWithSearchSchema(
                    state.schema.options.search,
                    resourceType,
                );
                typeOptionState.keyItemSets = querySearchProps.keyItemSets;
                typeOptionState.valueHandlerMap = querySearchProps.valueHandlerMap;

                if (state.schema.options?.fields) {
                    apiQuery.setOnly(...state.schema.options.fields.map((d) => {
                        if (d.options?.root_path) return `${d.options.root_path}.${d.key}`;
                        return d.key;
                    }));
                }
            } catch (e) {
                console.error(e);
            }
        };

        const listResources = async () => {
            typeOptionState.loading = true;
            try {
                let api = SpaceConnector.client;
                const resourceType = state.resource.resource_type.split('?')[0] || '';
                resourceType.split('.').forEach((d) => {
                    api = api[camelCase(d)];
                });

                apiQuery.setFilters(tableQueryHelper.filters)
                    .addFilter(...extraQueryHelper.filters,
                        { k: 'project_id', v: props.projectId, o: '=' });

                const res = await api.list({
                    query: apiQuery.data,
                });

                state.data = res.results;
                typeOptionState.totalCount = res.total_count;
                validateResources();
            } catch (e) {
                console.error(e);
                state.data = null;
                typeOptionState.totalCount = 0;
                validateResources();
            } finally {
                typeOptionState.loading = false;
            }
        };

        const onFetchTable = async (changed: any = {}) => {
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

        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        const resetTable = async () => {
            // reset table schema and data
            state.schema = null;
            state.data = null;

            // reset table api query
            fetchOptionState.pageStart = 1;
            fetchOptionState.pageLimit = 15;
            fetchOptionState.sortDesc = true;
            fetchOptionState.sortBy = 'created_at';

            tableQueryHelper.setFiltersAsRawQuery(formState.resourceGroup?.options.raw_filter || []);
            fetchOptionState.queryTags = tableQueryHelper.queryTags;

            // set table schema
            if (state.selectedTypeIndex !== -1) {
                await getPageSchema();

                apiQuery.setPageStart(fetchOptionState.pageStart);
                apiQuery.setPageLimit(fetchOptionState.pageLimit);
                apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc);

                await onFetchTable();
            }
        };

        /* forms */
        const onSelectedTypeIndexChange = async (idx) => {
            state.selectedTypeIndex = idx;
            state.resource.resource_type = state.supportResourceGroupTypeItems[idx]?.name || '';
            validateResourceType();
            if (idx !== -1) await resetTable();
        };

        const resetAll = async () => {
            // reset validations
            validState.showValidation = false;
            validState.name = false;
            validState.resourceType = false;
            validState.resources = false;

            // reset forms
            state.name = formState.resourceGroup?.name || '';


            state.selectedTypeIndex = findIndex(state.supportResourceGroupTypeItems, { name: formState.resourceGroup?.resources[0]?.resource_type });

            // reset resource
            state.resource = formState.resourceGroup?.resources[0] || { filter: [], keyword: '', resource_type: '' };

            await resetTable();
        };

        const onClickCancel = async () => {
            if (props.resourceGroupId) await router.go(-1);
            else emit('cancel');
        };

        const onClickSave = () => {
            validState.showValidation = true;
            if (!validate()) return;

            listModalState.visible = true;
        };


        /* list modal */
        const onListModalConfirm = () => {
            const { filter, keyword } = tableQueryHelper.apiQuery;

            state.resource.filter = [...filter, ...extraQueryHelper.apiQuery.filter];
            state.resource.keyword = keyword;

            const params: ResourceGroupItem = {
                name: state.name,
                count: typeOptionState.totalCount,
                resource_group: {
                    name: state.name,
                    resources: [{ ...state.resource }],
                    options: {
                        raw_filter: tableQueryHelper.rawQueries,
                    },
                },
                recommended: false,
            };

            if (formState.resourceGroup?.resource_group_id) params.resource_group.resource_group_id = formState.resourceGroup.resource_group_id;

            emit('confirm', params);
            listModalState.visible = false;
        };

        const getResourceGroup = async () => {
            try {
                const res = await SpaceConnector.client.inventory.resourceGroup.get({
                    resource_group_id: props.resourceGroupId,
                });
                formState.resourceGroup = res;
            } catch (e) {
                showErrorMessage(vm.$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.ALT_E_ID_INVALID_TITLE'), vm.$t('AUTOMATION.POWER_SCHEDULER.RESOURCE.ALT_E_ID_INVALID_DESC'), vm.$root);
                await router.replace({
                    name: AUTOMATION_ROUTE.POWER_SCHEDULER.ADD._NAME,
                    params: {
                        projectId: props.projectId,
                        scheduleId: props.scheduleId as string,
                        resourceGroupId: null as unknown as string,
                    },
                });
            }
        };

        const getSupportedResourceGroupTypes = async () => {
            try {
                state.supportResourceGroupTypes = await SpaceConnector.client.powerScheduler.schedule.getSupportedResourceTypes();
            } catch (e) {
                state.supportResourceGroupTypes = {};
            }
        };
        /* init */
        (async () => {
            await getSupportedResourceGroupTypes();

            // by url enter case
            if (props.resourceGroupId) {
                await getResourceGroup();
                await resetAll();
            } else {
                watch(() => props.visible, async (aft, bef) => {
                    if (aft && !bef) {
                        formState.resourceGroup = props.resourceGroup;
                        await resetAll();
                    }
                }, { immediate: true });
            }
        })();


        return {
            ...toRefs(state),
            fetchOptionState,
            typeOptionState,
            validState,
            listModalState,
            validateName,
            listResources,
            onFetchTable,
            fieldHandler,
            onClickCancel,
            onClickSave,
            onSelectedTypeIndexChange,
            onListModalConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
$height: calc(100vh - ($gnb-height));

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}

.general-page-layout {
    @apply bg-white fixed;
    z-index: 2;
    top: $gnb-height;
    left: 0;
    height: $height;
    width: 100vw;
    overflow: auto;
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
    .p-autocomplete-search .p-context-menu {
        max-height: 20rem;
    }
}
.resource-table.modal-table::v-deep .p-toolbox-table {
    height: unset;
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
.check-title {
    font-size: 1.5rem;
    line-height: 1.2;
    .count {
        @apply text-gray-500;
        font-size: 1rem;
    }
}
</style>
