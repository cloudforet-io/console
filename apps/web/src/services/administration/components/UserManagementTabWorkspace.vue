<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PDataTable, PHeading, PI,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { TimeStamp } from '@/schema/_common/model';
import type { RoleBindingListParameters } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

interface TableItem {
    project_id?: string;
    name?: string;
    date?: TimeStamp;
    key?: string;
    value?: string;
}
interface Props {
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();

const router = useRouter();

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    tags: {},
    items: [] as TableItem[],
    sortBy: 'workspace_id',
    sortDesc: true,
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'workspace_id', label: i18n.t('IAM.USER.MAIN.WORKSPACE') as string },
        { name: 'role_type', label: i18n.t('IAM.USER.MAIN.ROLE_TYPE') as string },
        { name: 'created_at', label: i18n.t('IAM.USER.MAIN.INVITED') as string },
    ]),
});
const handleChangeSort = (sortBy, sortDesc) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
    getWorkspaceList();
};
const handleClickLink = (id: string) => {
    router.push({ name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId: id } });
};

/* API */
const workspaceApiHelper = new ApiQueryHelper()
    .setPage(1, 15);
const getWorkspaceList = async () => {
    state.loading = true;
    workspaceApiHelper.setSort(state.sortBy, state.sortDesc);
    workspaceApiHelper.setFilters([
        { k: 'user_id', v: state.selectedUser.user_id || '', o: '=' },
        { k: 'resource_group', v: RESOURCE_GROUP.WORKSPACE, o: '=' },
    ]);
    try {
        const { results: workspaceResults } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>();
        const { results } = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>({
            query: workspaceApiHelper.data,
        });
        if (!results) {
            state.items = [];
            return;
        }
        state.items = (results ?? []).map((k) => ({
            workspace_id: {
                name: workspaceResults?.find((w) => w.workspace_id === k.workspace_id)?.name,
                id: k.workspace_id,
            },
            role_type: k.role_type,
            created_at: k.created_at,
        }));
    } catch (e) {
        state.items = [];
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    await getWorkspaceList();
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-workspace">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.ASSOCIATED_WORKSPACE')"
        />
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      :loading="state.loading"
                      :sort-by="state.sortBy"
                      :sort-desc="state.sortDesc"
                      sortable
                      @changeSort="handleChangeSort"
        >
            <template #col-workspace_id-format="{value}">
                <span class="workspace-id-wrapper">
                    <span>{{ value.name }}</span>
                    <router-link :to="{ name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId: value.id } }"
                                 target="_blank"
                    >
                        <p-i name="ic_arrow-right-up"
                             width="0.75rem"
                             height="0.75rem"
                             class="icon-link"
                             @click="handleClickLink(value.id)"
                        />
                    </router-link>
                </span>
            </template>
            <template #col-role_type-format="{value}">
                <span class="role-type">
                    <img :src="useRoleFormatter(value).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ useRoleFormatter(value).name }}</span>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
        </p-data-table>
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-workspace {
    @apply flex flex-col;
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
    .workspace-id-wrapper {
        @apply flex items-center;
        gap: 0.125rem;
    }
    .icon-link {
        @apply cursor-pointer;
    }
}
</style>
