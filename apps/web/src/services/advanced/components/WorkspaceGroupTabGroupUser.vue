<script setup lang="ts">
import { reactive } from 'vue';

import {
    PHeading, PButton, PToolboxTable, PStatus, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';



const tableState = reactive({
    fields: [
        // TODO: temp data
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'role', label: 'Role' },
        { name: 'remove_button', label: ' ' },
    ],
    items: [{
        // TODO: temp data
        user_id: 'Kara_Herzog@yahoo.com',
        name: '',
        state: 'ENABLED',
        role: 'WORKSPACE_OWNER',
    }],
});

const selectDropdownState = reactive({
    items: [{
        label: 'Workspace Member',
        name: 'managed-workspace-member',
        role_type: 'WORKSPACE_MEMBER',
    },
    {
        label: 'Workspace Member',
        name: 'managed-workspace-member',
        role_type: 'WORKSPACE_MEMBER',
    },
    {
        label: 'Workspace Member',
        name: 'managed-workspace-member',
        role_type: 'WORKSPACE_MEMBER',
    },
    {
        label: 'show more',
        type: 'showMore',
    },
    ],
});

const dropdownMenuHandler = () => ({
    results: selectDropdownState.items,
});

const handleRoleMenuItemClick = () => {
    showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.ALT_S_UPDATE_ROLE'), '');
};
</script>

<template>
    <section class="workspace-group-tab-group-user">
        <p-heading class="workspace-group-tab-group-user-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER')"
                   use-total-count
                   :total-count="28"
                   heading-type="sub"
        >
            <template #extra>
                <div class="workspace-group-tab-group-user-button-wrapper">
                    <p-button style-type="secondary"
                              disabled
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                    </p-button>
                    <p-button style-type="secondary"
                              icon-left="ic_plus_bold"
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.ADD_USER') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-toolbox-table class="workspace-group-tab-group-user-table"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         selectable
        >
            <template #col-state-format="{ value }">
                <p-status v-bind="workspaceStateFormatter(value)" />
            </template>
            <template #col-role-format="{ value }">
                <span class="role-type">
                    <img :src="useRoleFormatter(value).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ useRoleFormatter(value).name }}</span>
                    <p-select-dropdown
                        is-filterable
                        use-fixed-menu-style
                        style-type="transparent"
                        class="role-select-dropdown"
                        page-size="5"
                        :handler="dropdownMenuHandler"
                    >
                        <template #dropdown-button>
                            <span>{{ value.name }}</span>
                        </template>
                        <template #menu-item--format="{ item }">
                            <div class="role-menu-item"
                                 @click="handleRoleMenuItemClick"
                            >
                                <img :src="useRoleFormatter(item.role_type).image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                                <p-tooltip position="bottom"
                                           :contents="item.label"
                                           class="role-label"
                                >
                                    <span>{{ item.label }}</span>
                                </p-tooltip>
                                <span class="role-type">{{ useRoleFormatter(item.role_type, true).name }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                </span>
            </template>
            <template #col-remove_button-format="{}">
                <p-button size="sm"
                          style-type="tertiary"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-group-user {
    .workspace-group-tab-group-user-button-wrapper {
        display: flex;
        gap: 1rem;
    }

    .workspace-group-tab-group-user-table {
        border: none;
    }

    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
        .role-select-dropdown {
            width: auto;
            .role-menu-item {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type-icon {
                    width: 1rem;
                    height: 1rem;
                }
                .role-label {
                    @apply truncate;
                    width: 14.375rem;
                }
                .role-type {
                    @apply text-label-sm text-gray-400;
                }
            }
        }
    }
}
</style>
