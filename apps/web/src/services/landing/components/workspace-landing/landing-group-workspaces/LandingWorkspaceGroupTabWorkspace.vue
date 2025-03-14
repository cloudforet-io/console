<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PToolboxTable, PLink, PStatus, PTooltip, PI,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserProfileGetWorkspacesParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/get-workspaces';
import type { MyWorkspaceModel } from '@/api-clients/identity/user-profile/schema/model';

import { useUserStore } from '@/store/user/user-store';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const fields = [
    { name: 'name', label: 'Name' },
    { name: 'state', label: 'State' },
    { name: 'created_at', label: 'Created' },
];
const landingPageStore = useLandingPageStore();
const landingPageStoreState = landingPageStore.state;
const userStore = useUserStore();

const tableState = reactive({
    loading: false,
    items: [] as MyWorkspaceModel[],
    convertedItems: computed<MyWorkspaceModel[]>(() => {
        const filteredWorkspaces = tableState.items.filter((workspace: MyWorkspaceModel) => {
            const searchText = tableState.searchText.trim();

            if (searchText === '') {
                return true;
            }

            const workspaceNameMatches = workspace.name && workspace.name.includes(searchText);

            return workspaceNameMatches;
        });
        const sortedWorkspacesInSelectedGroup = filteredWorkspaces?.sort((a, b) => {
            const aValue = a[tableState.sortBy];
            const bValue = b[tableState.sortBy];

            if (aValue === undefined) return 1;
            if (bValue === undefined) return -1;

            if (typeof aValue === 'number' && tableState.sortDesc) {
                return bValue - aValue;
            }
            if (typeof aValue === 'number' && !tableState.sortDesc) {
                return aValue - bValue;
            }

            if (tableState.sortDesc) {
                return bValue.localeCompare(aValue);
            }

            return aValue.localeCompare(bValue);
        });

        if (tableState.totalCount < tableState.pageStart - 1 + tableState.pageLimit) {
            return sortedWorkspacesInSelectedGroup.slice(tableState.pageStart - 1);
        }

        return sortedWorkspacesInSelectedGroup?.slice(tableState.pageStart - 1, tableState.pageStart - 1 + tableState.pageLimit);
    }),
    totalCount: computed(() => tableState.items.length),
    pageStart: 1,
    thisPage: 1,
    pageLimit: 15,
    searchText: '',
    sortBy: 'name',
    sortDesc: true,
    timezone: computed<string|undefined>(() => userStore.state.timezone),
});

const getWorkspaceRouteLocationByWorkspaceId = (item) => ({
    name: WORKSPACE_HOME_ROUTE._NAME,
    params: {
        workspaceId: item?.workspace_id,
    },
});

const fetchWorkspaces = async () => {
    tableState.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.identity.userProfile.getWorkspaces<UserProfileGetWorkspacesParameters, ListResponse<MyWorkspaceModel>>({
            workspace_group_id: landingPageStoreState.selectedWorkspaceGroup,
        });
        tableState.items = results ?? [];
    } catch (e) {
        // ErrorHandler.handleError(e);
    } finally {
        tableState.loading = false;
    }
};

const handleChange = async (options: any = {}) => {
    if (options.pageStart) {
        tableState.pageStart = options.pageStart;
    }

    if (options.pageLimit) {
        tableState.pageStart = 1;
        tableState.pageLimit = options.pageLimit;
        tableState.thisPage = 1;
    }
};

const handleChangeSort = (name:string, isDesc:boolean) => {
    tableState.sortBy = name;
    tableState.sortDesc = isDesc;
};

const handleRefresh = () => {
    tableState.thisPage = 1;
    tableState.searchText = '';
    fetchWorkspaces();
};

watch(() => tableState.searchText, () => {
    tableState.thisPage = 1;
});

onMounted(() => {
    fetchWorkspaces();
});
</script>

<template>
    <section class="workspace-group-tab-workspace">
        <p-heading class="pt-8 px-4 pb-4"
                   :title="$t('IAM.WORKSPACE_GROUP.TAB.WORKSPACE')"
                   use-total-count
                   :total-count="tableState.totalCount"
                   heading-type="sub"
        />
        <p-toolbox-table class="workspace-group-tab-workspace-table"
                         :loading="tableState.loading"
                         :fields="fields"
                         :items="tableState.convertedItems"
                         :total-count="tableState.totalCount"
                         sort-by="name"
                         search-type="plain"
                         :sort-desc="true"
                         :this-page.sync="tableState.thisPage"
                         :search-text.sync="tableState.searchText"
                         sortable
                         searchable
                         @change="handleChange"
                         @refresh="handleRefresh"
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
            <template #col-name-format="{ value, item }">
                <div class="name-wrapper">
                    <workspace-logo-icon :text="value"
                                         :theme="item.tags?.theme"
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
            <template #col-created_at-format="{ value }">
                {{ dayjs.tz(dayjs.utc(value), tableState.timezone).format('YYYY-MM-DD HH:mm') }}
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
