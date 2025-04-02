<script setup lang="ts">
import {
    computed, onMounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    getApiQueryWithToolboxOptions,
} from '@cloudforet/core-lib/component-util/toolbox';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PSelectDropdown, PStatus, PToolboxTable, PLink, PSelectStatus, PI, PTooltip,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type {
    ValueItem,
} from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import { iso8601Formatter, numberFormatter } from '@cloudforet/utils';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import {
    EXCEL_TABLE_FIELDS,
    WORKSPACE_SEARCH_HANDLERS, WORKSPACE_STATE,
    WORKSPACE_TABLE_FIELDS,
} from '@/services/advanced/constants/workspace-constant';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

interface Props {
    tableHeight?: number;
    hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const emit = defineEmits<{(e: 'select-action', value: string): void; }>();

const userStore = useUserStore();
const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;

const route = useRoute();

const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(workspacePageState.pageStart).setPageLimit(workspacePageState.pageLimit)
    .setSort('name', true);
let workspaceListApiQuery = workspaceListApiQueryHelper.data;

const queryTagsHelper = useQueryTags({ keyItemSets: WORKSPACE_SEARCH_HANDLERS.keyItemSets });
const { queryTags } = queryTagsHelper;
if (route.query.selectedWorkspaceId) {
    queryTagsHelper.setFilters([
        {
            k: 'workspace_id',
            v: route.query.selectedWorkspaceId,
            o: '=',
        },
    ]);
}

const storeState = reactive({
    timezone: computed(() => userStore.state.timezone ?? 'UTC'),
    selectedType: computed<string>(() => workspacePageState.selectedType),
    searchFilters: computed<ConsoleFilter[]>(() => workspacePageState.searchFilters),
    currency: computed<Currency|undefined>(() => workspacePageStore.currency),
});
const state = reactive({
    typeField: computed<ValueItem[]>(() => ([
        { label: i18n.t('IAM.WORKSPACES.ALL') as string, name: 'ALL' },
        { label: i18n.t('IAM.WORKSPACES.ENABLE') as string, name: WORKSPACE_STATE.ENABLE },
        { label: i18n.t('IAM.WORKSPACES.DISABLE') as string, name: WORKSPACE_STATE.DISABLE },
        { label: i18n.t('IAM.WORKSPACES.DORMANT') as string, name: WORKSPACE_STATE.DORMANT },
    ])),
});

const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item',
        name: 'enable',
        label: i18n.t('IAM.WORKSPACES.ENABLE'),
        disabled: workspacePageState.selectedIndices.length !== 1 || (workspacePageState.selectedIndices.length === 1 && workspacePageStore.selectedWorkspaces[0]?.state === 'ENABLED'),
    },
    {
        type: 'item',
        name: 'disable',
        label: i18n.t('IAM.WORKSPACES.DISABLE'),
        disabled: workspacePageState.selectedIndices.length !== 1 || (workspacePageState.selectedIndices.length === 1 && workspacePageStore.selectedWorkspaces[0]?.state === 'DISABLED'),
    },
    {
        type: 'divider',
    },
    {
        type: 'item',
        name: 'edit',
        label: i18n.t('IAM.WORKSPACES.EDIT'),
        disabled: workspacePageState.selectedIndices.length !== 1,
    },
    {
        type: 'item',
        name: 'delete',
        label: i18n.t('IAM.WORKSPACES.DELETE'),
        disabled: workspacePageState.selectedIndices.length !== 1,
    },
]));

const getRowSelectable = (item) => item.role_type !== ROLE_TYPE.SYSTEM_ADMIN;

const handleSelectDropdown = (name: string) => {
    emit('select-action', name);
};

const handleSelectType = async (value: string) => {
    const filters = workspaceListApiQueryHelper.filters;
    const statusFilterIndex = storeState.searchFilters.findIndex((filter) => filter.k === 'state');
    const dormantFilterIndex = storeState.searchFilters.findIndex((filter) => filter.k === 'is_dormant');

    const isDormantSelected = value === WORKSPACE_STATE.DORMANT;
    const isAllSelected = value === 'ALL';

    if (isDormantSelected) {
        if (statusFilterIndex !== -1) filters.splice(statusFilterIndex, 1);
        if (dormantFilterIndex === -1) {
            filters.push({ k: 'is_dormant', v: true, o: '=' });
        } else {
            filters[dormantFilterIndex].v = true;
        }
    } else {
        if (dormantFilterIndex !== -1) filters.splice(dormantFilterIndex, 1);
        if (statusFilterIndex === -1 && !isAllSelected) {
            filters.push({ k: 'state', v: value, o: '=' });
        } else if (statusFilterIndex !== -1) {
            if (isAllSelected) {
                filters.splice(statusFilterIndex, 1);
            } else {
                filters[statusFilterIndex].v = value;
            }
        }
    }

    workspaceListApiQueryHelper.setFilters(filters);
    workspacePageStore.$patch((_state) => {
        _state.selectedType = value;
        _state.searchFilters = workspaceListApiQueryHelper.filters;
    });
    await workspacePageStore.load({ query: workspaceListApiQueryHelper.data });
};
const handleSelect = (index: number[]) => {
    workspacePageStore.$patch({ selectedIndices: index });
};
const handleChange = async (options: ToolboxOptions = {}) => {
    workspaceListApiQuery = getApiQueryWithToolboxOptions(workspaceListApiQueryHelper, options) ?? workspaceListApiQuery;
    if (options.queryTags !== undefined) {
        workspacePageStore.$patch((_state) => {
            _state.searchFilters = workspaceListApiQueryHelper.filters;
        });
    }
    if (options.pageStart !== undefined) workspacePageStore.$patch({ pageStart: options.pageStart });
    if (options.pageLimit !== undefined) workspacePageStore.$patch({ pageLimit: options.pageLimit });
    await workspacePageStore.load({ query: workspaceListApiQuery });
};

const handleExport = async () => {
    try {
        await downloadExcel({
            data: workspacePageState.workspaces,
            fields: EXCEL_TABLE_FIELDS,
            file_name_prefix: FILE_NAME_PREFIX.workspace,
            timezone: storeState.timezone,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const getWorkspaceRouteLocationByWorkspaceName = (item: WorkspaceModel) => ({
    name: WORKSPACE_HOME_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const getUserRouteLocationByWorkspaceName = (item: WorkspaceModel) => ({
    name: IAM_ROUTE.USER._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});
const getServiceAccountRouteLocationByWorkspaceName = (item: WorkspaceModel) => ({
    name: SERVICE_ACCOUNT_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

onMounted(async () => {
    await workspacePageStore.fetchCostReportConfig();
});

const reduce = (arr: (number & undefined)[]) => arr.reduce((acc, value) => acc + (value ?? 0), 0);

const costInfoReduce = (arr: (number | {month: any})[] | any) => {
    const result = arr.reduce((acc, cur) => (acc + Object.keys(cur).includes('month') ? cur?.month : 0), 0);

    return result;
};
</script>

<template>
    <section class="workspace-management-table">
        <p-toolbox-table search-type="query"
                         searchable
                         selectable
                         sortable
                         exportable
                         :loading="false"
                         :multi-select="false"
                         :show-footer="true"
                         disabled
                         :items="workspacePageState.workspaces"
                         :select-index="workspacePageState.selectedIndices"
                         :fields="WORKSPACE_TABLE_FIELDS"
                         sort-by="name"
                         :sort-desc="true"
                         :total-count="workspacePageState.totalCount"
                         :key-item-sets="WORKSPACE_SEARCH_HANDLERS.keyItemSets"
                         :value-handler-map="WORKSPACE_SEARCH_HANDLERS.valueHandlerMap"
                         :query-tags="queryTags"
                         :style="{height: `${props.tableHeight}px`}"
                         :get-row-selectable="getRowSelectable"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
                         @export="handleExport"
        >
            <template #toolbox-bottom>
                <div class="select-type-wrapper">
                    <span class="mr-2">{{ $t('IAM.WORKSPACES.STATE') }}</span>
                    <p-select-status v-for="(item, idx) in state.typeField"
                                     :key="idx"
                                     :selected="storeState.selectedType"
                                     class="mr-2"
                                     :value="item.name"
                                     @change="handleSelectType"
                    >
                        {{ item.label }}
                    </p-select-status>
                </div>
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :menu="dropdownMenu"
                                   reset-selection-on-menu-close
                                   reset-selected-on-unmounted
                                   :placeholder="$t('IAM.WORKSPACES.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </template>
            <template #th-state-format="{ field }">
                <div class="th-tooltip">
                    <span>{{ field.label }}</span>
                    <p-tooltip
                        :contents="String($t('IAM.WORKSPACES.TOOLTIP_STATE'))"
                        position="bottom"
                        class="tooltip-wrapper"
                        content-class="custom-tooltip-content"
                    >
                        <p-i name="ic_info-circle"
                             class="title-tooltip"
                             height="1rem"
                             width="1rem"
                             :color="gray[500]"
                        />
                    </p-tooltip>
                </div>
            </template>
            <template #th-cost_info-format="{ field }">
                <div class="th-tooltip">
                    <span>{{ field.label }}</span>
                    <p-tooltip
                        :contents="String($t('IAM.WORKSPACES.TOOLTIP_COST'))"
                        position="bottom"
                        class="tooltip-wrapper"
                    >
                        <p-i name="ic_info-circle"
                             class="title-tooltip"
                             height="1rem"
                             width="1rem"
                             :color="gray[500]"
                        />
                    </p-tooltip>
                </div>
            </template>
            <template #col-name-format="{value, item}">
                <div class="col-name">
                    <workspace-logo-icon :text="value"
                                         :theme="item?.tags?.theme"
                                         size="xs"
                    />
                    <p-link :text="value"
                            action-icon="internal-link"
                            :disabled="item.state === WORKSPACE_STATE.DISABLE || item.is_dormant"
                            new-tab
                            :to="getWorkspaceRouteLocationByWorkspaceName(item)"
                    />
                </div>
            </template>
            <template #col-state-format="{value, item}">
                <p-status v-bind="workspaceStateFormatter(item.is_dormant ? WORKSPACE_STATE.DORMANT : value)"
                          class="capitalize"
                />
            </template>
            <template #col-user_count-format="{value, item}">
                <p-link :text="value ?? 0"
                        action-icon="internal-link"
                        :disabled="item.state === WORKSPACE_STATE.DISABLE || item.is_dormant"
                        new-tab
                        :to="getUserRouteLocationByWorkspaceName(item)"
                />
            </template>
            <template #col-service_account_count-format="{value, item}">
                <p-link :text="value || 0"
                        action-icon="internal-link"
                        :disabled="item.state === WORKSPACE_STATE.DISABLE || item.is_dormant"
                        new-tab
                        :to="getServiceAccountRouteLocationByWorkspaceName(item)"
                />
            </template>
            <template #col-cost_info-format="{value}">
                <p>
                    <span>{{ CURRENCY_SYMBOL[String(storeState.currency)] }}</span>
                    {{ numberFormatter(value?.month) || 0 }}
                </p>
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #tf-col-format="{field, colIndex, values}">
                <span v-if="colIndex === 0">Total</span>
                <span v-if="field.name === 'user_count'">{{ reduce(values) }}</span>
                <span v-if="field.name === 'service_account_count'">{{ reduce(values) }}</span>
                <span v-if="field.name === 'cost_info'">
                    <span>{{ CURRENCY_SYMBOL[storeState.currency ?? 'USD'] }}</span>
                    {{ costInfoReduce(values) }}
                </span>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-management-table {
    .col-name {
        @apply flex items-center;
        gap: 0.5rem;
    }
    .left-toolbox-item-select-dropdown {
        min-width: 6.5rem;
    }
    .select-type-wrapper {
        @apply flex items-center text-label-md text-gray-600;
        gap: 0.5rem;
        margin-top: -0.5rem;
        margin-left: 1rem;
        margin-bottom: 1rem;
    }
    .th-tooltip {
        @apply flex items-center;
        gap: 0.25rem;
        .tooltip-wrapper {
            margin-top: -0.125rem;
        }
    }
}
</style>

<style lang="postcss">
/* custom design-system component - p-tooltip */
.p-tooltip {
    .tooltip-inner {
        white-space: pre-line;
        max-width: 16rem;
    }
}
</style>
