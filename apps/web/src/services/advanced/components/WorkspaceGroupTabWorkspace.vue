<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import {
    PButton, PHeading, PI, PLink, PStatus, PToolboxTable, PTooltip, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { numberFormatter } from '@cloudforet/utils';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceTabState = workspaceGroupPageStore.workspaceTabState;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();

const { hasReadWriteAccess } = usePageEditableStatus();

interface WorkspaceTableItem extends WorkspaceModel {
    remove_button: WorkspaceModel;
}

const state = reactive({
    currency: computed<Currency|undefined>(() => workspaceGroupPageGetters.currency),
});
const tableState = reactive({
    timezone: computed(() => userStore.state.timezone),
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    tableItems: computed<WorkspaceTableItem[]>(() => workspaceTabState.workspacesInSelectedGroup?.map((workspace) => ({
        ...workspace,
        remove_button: workspace,
    }))),
    fields: computed<DataTableFieldType[]>(() => {
        const defaultFields: DataTableFieldType[] = [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'user_count', label: 'User' },
            { name: 'service_account_count', label: 'Service Account' },
            { name: 'cost_info', label: 'Cost' },
            { name: 'created_at', label: 'Created' },
        ];
        if (hasReadWriteAccess.value) {
            defaultFields.push({ name: 'remove_button', label: ' ', sortable: false });
        }
        return defaultFields;
    }),
});

const getWorkspaceRouteLocationByWorkspaceId = (item) => ({
    name: WORKSPACE_HOME_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const getUserRouteLocationByWorkspaceId = (item) => ({
    name: IAM_ROUTE.USER._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const getServiceAccountRouteLocationByWorkspaceId = (item) => ({
    name: SERVICE_ACCOUNT_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const setupModal = (type) => {
    switch (type) {
    case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.DELETE_WORKSPACES_TITLE'),
        visible: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES,
        themeColor: 'alert',
    }); break;
    case WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.DELETE_WORKSPACES_TITLE'),
        visible: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE,
        themeColor: 'alert',
    }); break;
    case WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_WORKSPACES_TITLE', { name: workspaceGroupPageGetters.selectedWorkspaceGroup.name }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES,
    }); break;
    default:
        break;
    }
};

const handleSelect = (index:number[]) => {
    workspaceTabState.selectedWorkspaceIndices = index;
};

const handleChange = async (options: any = {}) => {
    if (options.pageStart) {
        workspaceTabState.pageStart = options.pageStart;
    }

    if (options.pageLimit) {
        workspaceTabState.pageStart = 1;
        workspaceTabState.pageLimit = options.pageLimit;
        workspaceTabState.thisPage = 1;
    }
    if (options.searchText) {
        workspaceTabState.thisPage = 1;
    }
    await workspaceGroupPageStore.listWorkspacesInSelectedGroup();
};

const handleAddWorkspaceButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES);
};

const handleSelectedWorkspacesRemoveButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES);
};

const handleSelectedWorkspaceRemoveButtonClick = (item:WorkspaceTableItem) => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE);
    workspaceGroupPageState.modalAdditionalData = {
        selectedWorkspace: item,
    };
};

const handleRefresh = () => {
    workspaceGroupPageStore.listWorkspacesInSelectedGroup();
};

const handleChangeSort = (name:string, isDesc:boolean) => {
    workspaceTabState.sortBy = name;
    workspaceTabState.selectedWorkspaceIndices = [];
    workspaceTabState.sortDesc = isDesc;
    workspaceTabState.thisPage = 1;
    workspaceGroupPageStore.listWorkspacesInSelectedGroup();
};

watch(() => workspaceGroupPageGetters.selectedWorkspaceGroupId, () => {
    workspaceGroupPageStore.listWorkspacesInSelectedGroup();
}, { immediate: true });

onMounted(async () => {
    await workspaceGroupPageStore.fetchCostReportConfig();
});

const reduce = (arr: (number | undefined)[] | any) => arr.reduce((acc, value) => acc + (value ?? 0), 0);

const costInfoReduce = (arr: (number | {month: any})[] | any) => {
    const result = arr.reduce((acc, cur) => (acc + Object.keys(cur).includes('month') ? cur?.month : 0), 0);

    return result;
};
</script>

<template>
    <section class="workspace-group-tab-workspace">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading class="workspace-group-tab-workspace-header"
                           :title="$t('IAM.WORKSPACE_GROUP.TAB.WORKSPACE')"
                           use-total-count
                           :total-count="workspaceTabState.workspacesInSelectedGroupTotalCount"
                           heading-type="sub"
                />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="negative-primary"
                          :disabled="!workspaceTabState.selectedWorkspaceIndices.length"
                          @click="handleSelectedWorkspacesRemoveButtonClick"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
                <p-button style-type="secondary"
                          icon-left="ic_plus_bold"
                          @click="handleAddWorkspaceButtonClick"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.ADD_WORKSPACE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-toolbox-table class="workspace-group-tab-workspace-table"
                         :loading="workspaceTabState.loading"
                         :fields="tableState.fields"
                         :items="tableState.tableItems"
                         :select-index.sync="workspaceTabState.selectedWorkspaceIndices"
                         :total-count="workspaceTabState.workspacesInSelectedGroupTotalCount"
                         sort-by="name"
                         search-type="plain"
                         :show-footer="true"
                         :sort-desc="workspaceTabState.sortDesc"
                         :this-page.sync="workspaceTabState.thisPage"
                         :search-text.sync="workspaceTabState.searchText"
                         :selectable="hasReadWriteAccess"
                         sortable
                         searchable
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleRefresh()"
                         @changeSort="handleChangeSort"
        >
            <template #th-state-format="{ field }">
                <div class="th-tooltip">
                    <span>{{ field.label }}</span>
                    <p-tooltip
                        :contents="String($t('IAM.WORKSPACE_GROUP.TOOLTIP_STATE'))"
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
            <template #th-cost-format="{ field }">
                <div class="th-tooltip">
                    <span>{{ field.label }}</span>
                    <p-tooltip
                        :contents="String($t('IAM.WORKSPACE_GROUP.TOOLTIP_COST'))"
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
            <template #col-name-format="{ value, item }">
                <div class="name-wrapper">
                    <workspace-logo-icon :text="value"
                                         :theme="item?.tags?.theme"
                                         size="xs"
                    />
                    <p-link :text="value"
                            action-icon="internal-link"
                            new-tab
                            :to="getWorkspaceRouteLocationByWorkspaceId(item)"
                    />
                </div>
            </template>
            <template #col-state-format="{ value }">
                <p-status v-bind="workspaceStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-user_count-format="{ value, item }">
                <p-link :text="value || 0"
                        action-icon="internal-link"
                        new-tab
                        :to="getUserRouteLocationByWorkspaceId(item)"
                />
            </template>
            <template #col-service_account_count-format="{ value, item }">
                <p-link :text="value || 0"
                        action-icon="internal-link"
                        new-tab
                        :to="getServiceAccountRouteLocationByWorkspaceId(item)"
                />
            </template>
            <template #col-cost_info-format="{ value }">
                <p>
                    <span>{{ CURRENCY_SYMBOL[state.currency ?? 'USD'] }}</span>
                    {{ numberFormatter(value?.month) || 0 }}
                </p>
            </template>
            <template #col-created_at-format="{ value }">
                {{ dayjs.tz(dayjs.utc(value), tableState.timezone).format('YYYY-MM-DD HH:mm') }}
            </template>
            <template #col-remove_button-format="{ item }">
                <p-button size="sm"
                          style-type="tertiary"
                          @click.stop="() => handleSelectedWorkspaceRemoveButtonClick(item)"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
            </template>
            <template #tf-col-format="{field, colIndex, values}">
                <span v-if="colIndex === 0">Total</span>
                <span v-else-if="field.name === 'user_count'">{{ reduce(values) }}</span>
                <span v-else-if="field.name === 'service_account_count'">{{ reduce(values) }}</span>
                <p
                    v-else-if="field.name === 'cost_info'"
                >
                    <span>{{ CURRENCY_SYMBOL[state.currency ?? 'USD'] }}</span>
                    {{ costInfoReduce(values) }}
                </p>
                <span v-else-if="field.name === 'state' && field.name === 'created_at'" />
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-workspace {
    .workspace-group-tab-workspace-table {
        border: none;

        .name-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .th-tooltip {
            @apply flex items-center;
            gap: 0.25rem;
            .tooltip-wrapper {
                margin-top: -0.125rem;
            }
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
