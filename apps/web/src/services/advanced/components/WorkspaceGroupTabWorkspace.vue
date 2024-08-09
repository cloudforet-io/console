<script setup lang="ts">
import { reactive } from 'vue';

import {
    PHeading, PButton, PToolboxTable, PLink, PStatus,
} from '@cloudforet/mirinae';

import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const tableState = reactive({
    // TODO: temp data
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'user', label: 'User' },
        { name: 'service_account', label: 'Service Account' },
        { name: 'cost', label: 'Cost' },
        { name: 'created_at', label: 'Created' },
        { name: 'remove_button', label: ' ' },
    ],
    // TODO: temp data
    items: [{
        name: 'cloudone-mz',
        state: 'ENABLED',
        user: 24,
        service_account: 23,
        cost: 5160.09,
        created_at: '2022-03-10 12:02:41',
        workspace_id: 'workspace-15fb37788416',
    }],
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

</script>

<template>
    <section class="workspace-group-tab-workspace">
        <p-heading class="workspace-group-tab-workspace-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TAB.WORKSPACE')"
                   use-total-count
                   :total-count="28"
                   heading-type="sub"
        >
            <template #extra>
                <div class="workspace-group-tab-workspace-button-wrapper">
                    <p-button style-type="secondary"
                              disabled
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                    </p-button>
                    <p-button style-type="secondary"
                              icon-left="ic_plus_bold"
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.ADD_WORKSPACE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-toolbox-table class="workspace-group-tab-workspace-table"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         selectable
        >
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
            <template #col-state-format="{ value }">
                <p-status v-bind="workspaceStateFormatter(value)" />
            </template>
            <template #col-user-format="{ value, item }">
                <p-link :text="value"
                        action-icon="internal-link"
                        new-tab
                        :to="getUserRouteLocationByWorkspaceId(item)"
                />
            </template>
            <template #col-service_account-format="{ value, item }">
                <p-link :text="value"
                        action-icon="internal-link"
                        new-tab
                        :to="getServiceAccountRouteLocationByWorkspaceId(item)"
                />
            </template>
            <template #col-remove_button-format>
                <p-button size="sm"
                          style-type="tertiary"
                          @click.stop=""
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
    }
}
</style>
