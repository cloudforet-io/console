<script setup lang="ts">
import {
    reactive, watch, onUnmounted, computed,
} from 'vue';

import dayjs from 'dayjs';

import {
    PHeading, PButton, PToolboxTable, PLink, PStatus, PTooltip, PI,
} from '@cloudforet/mirinae';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;

const emit = defineEmits<{(e: 'refresh', payload: { isGroupUser?: boolean, isWorkspace?: boolean }): void; }>();

const allReferenceStore = useAllReferenceStore();

const tableState = reactive({
    timezone: computed(() => store.state.user.timezone),
    workspaces: computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace),
    tableItems: computed(() => workspaceGroupPageGetters.selectedWorkspaces?.map((workspace) => ({
        ...tableState.workspaces[workspace],
        remove_button: workspace,
    }))),
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'data.state', label: 'State' },
        { name: 'data.user', label: 'User' },
        { name: 'data.service_account_count', label: 'Service Account' },
        { name: 'data.cost_info', label: 'Cost' },
        { name: 'data.created_at', label: 'Created' },
        { name: 'remove_button', label: ' ', sortable: false },
    ],
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
    name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
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
        visible: WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES,
        themeColor: 'alert',
    }); break;
    case WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES: workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_WORKSPACES_TITLE', { name: 'yubeom kim' }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES,
    }); break;
    default:
        break;
    }
};

const handleSelect = (index) => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedWorkspaceIndices = index;
    });
};

const handleChange = (options: any = {}) => {
    if (options.pageStart) {
        workspaceGroupPageStore.$patch((_state) => {
            _state.state.workspacePageStart = options.pageStart;
        });
    }

    if (options.pageLimit) {
        workspaceGroupPageStore.$patch((_state) => {
            _state.state.workspacePageStart = 1;
            _state.state.workspacePageLimit = options.pageLimit;
            _state.state.workspacePage = 1;
        });
    }
};

const handleAddWorkspaceButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES);
};

const handleSelectedWorkspacesRemoveButtonClick = () => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_WORKSPACES);
};

const handleSelectedWorkspaceRemoveButtonClick = (item) => {
    setupModal(WORKSPACE_GROUP_MODAL_TYPE.REMOVE_SINGLE_WORKSPACE);
    workspaceGroupPageState.modalAdditionalData.selectedWorkspace = item;
};

const handleRefresh = () => {
    emit('refresh', { isWorkspace: true });
};

const handleChangeSort = (name, isDesc) => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.workspaceSortBy = name;
        _state.state.selectedWorkspaceIndices = [];
        _state.state.isWorkspaceSortDesc = isDesc;
    });
};

watch(() => workspaceGroupPageState.workspaceSearchText, () => {
    workspaceGroupPageStore.$patch((_state) => {
        _state.state.selectedWorkspaceIndices = [];
    });
});

onUnmounted(() => {
    workspaceGroupPageStore.resetWorkspace();
});
</script>

<template>
    <section class="workspace-group-tab-workspace">
        <p-heading class="workspace-group-tab-workspace-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TAB.WORKSPACE')"
                   use-total-count
                   :total-count="workspaceGroupPageGetters.workspaceTotalCount"
                   heading-type="sub"
        >
            <template #extra>
                <div class="workspace-group-tab-workspace-button-wrapper">
                    <p-button style-type="negative-primary"
                              :disabled="!workspaceGroupPageGetters.selectedWorkspacesByIndices.length"
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
                </div>
            </template>
        </p-heading>
        <p-toolbox-table class="workspace-group-tab-workspace-table"
                         :loading="workspaceGroupPageState.loading"
                         :fields="tableState.fields"
                         :items="tableState.tableItems"
                         :select-index="workspaceGroupPageState.selectedWorkspaceIndices"
                         :total-count="workspaceGroupPageGetters.workspaceTotalCount"
                         sort-by="name"
                         search-type="plain"
                         :sort-desc="true"
                         :this-page.sync="workspaceGroupPageState.workspacePage"
                         :search-text.sync="workspaceGroupPageState.workspaceSearchText"
                         selectable
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
                        :contents="$t('IAM.WORKSPACE_GROUP.TOOLTIP_STATE')"
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
                        :contents="$t('IAM.WORKSPACE_GROUP.TOOLTIP_COST')"
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
                                         size="xs"
                    />
                    <p-link :text="value"
                            action-icon="internal-link"
                            new-tab
                            :to="getWorkspaceRouteLocationByWorkspaceId(item)"
                    />
                </div>
            </template>
            <template #col-data.state-format="{ value }">
                <p-status v-bind="workspaceStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-data.user-format="{ value, item }">
                <p-link :text="value"
                        action-icon="internal-link"
                        new-tab
                        :to="getUserRouteLocationByWorkspaceId(item)"
                />
            </template>
            <template #col-data.service_account_count-format="{ value, item }">
                <p-link :text="value || 0"
                        action-icon="internal-link"
                        new-tab
                        :to="getServiceAccountRouteLocationByWorkspaceId(item)"
                />
            </template>
            <template #col-data.cost_info-format="{ value }">
                {{ value?.month ?? '-' }}
            </template>
            <template #col-data.created_at-format="{ value }">
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
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-workspace {
    .workspace-group-tab-workspace-button-wrapper {
        display: flex;
        gap: 1rem;
    }

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
