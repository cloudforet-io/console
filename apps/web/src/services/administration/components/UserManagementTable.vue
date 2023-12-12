<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PBadge, PStatus, PToolboxTable, PButton,
} from '@spaceone/design-system';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementTableToolbox from '@/services/administration/components/UserManagementTableToolbox.vue';
import {
    calculateTime, userStateFormatter, userMfaFormatter, userRoleFormatter,
} from '@/services/administration/composables/refined-user-data';
import {
    USER_SEARCH_HANDLERS, USER_TABLE_FIELDS,
} from '@/services/administration/constants/user-table-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const appContextStore = useAppContextStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const route = useRoute();

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    userRoleType: computed(() => store.state.user.roleType),
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});
const state = reactive({
    refinedUserItems: computed(() => userPageState.users.map((user) => ({
        ...user,
        api_key_count: user.api_key_count ?? 0,
        mfa: user.mfa && user.mfa.state === 'ENABLED' ? 'ON' : 'OFF',
        last_accessed_at: calculateTime(user.last_accessed_at, storeState.timezone),
    }))),
    isSelected: computed(() => userPageState.selectedIndices.length > 0),
    tags: userListApiQueryHelper.setKeyItemSets(USER_SEARCH_HANDLERS.keyItemSets).queryTags,
});
const tableState = reactive({
    userTableFields: computed(() => (!storeState.isAdminMode && storeState.userRoleType === ROLE_TYPE.WORKSPACE_OWNER
        ? [
            ...USER_TABLE_FIELDS,
            { name: 'role_binding_info', label: ' ', sortable: false },
        ]
        : USER_TABLE_FIELDS
    )),
});

/* Component */
const handleSelect = async (index) => {
    userPageStore.$patch({ selectedIndices: index });
};
const handleClickButton = async (value: RoleBindingModel) => {
    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete({
            role_binding_id: value.role_binding_id,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_REMOVE_USER'), '');
        emit('confirm');
    } catch (e) {
        showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_REMOVE_USER'), '');
        ErrorHandler.handleError(e);
    }
};
/* API */
let userListApiQuery = userListApiQueryHelper.data;
const handleChange = async (options: any = {}) => {
    userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', userListApiQueryHelper.rawQueryStrings);
    }
    if (storeState.isAdminMode) {
        await userPageStore.listUsers({ query: userListApiQuery });
    } else {
        await userPageStore.listWorkspaceUsers({ query: userListApiQuery });
    }
};
</script>

<template>
    <section class="user-management-table">
        <p-toolbox-table
            search-type="query"
            searchable
            selectable
            sortable
            :loading="userPageState.loading.list"
            :items="state.refinedUserItems"
            :select-index="userPageState.selectedIndices"
            :fields="tableState.userTableFields"
            sort-by="name"
            :sort-desc="true"
            :total-count="userPageState.totalCount"
            :key-item-sets="USER_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="USER_SEARCH_HANDLERS.valueHandlerMap"
            :query-tags="state.tags"
            :style="{height: `${props.tableHeight}px`}"
            @select="handleSelect"
            @change="handleChange"
            @refresh="handleChange()"
        >
            <template #toolbox-left>
                <user-management-table-toolbox v-if="storeState.isAdminMode" />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-mfa-format="{value}">
                <p-status v-bind="userMfaFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role_type-format="{value}">
                <span class="role-type">
                    <img :src="userRoleFormatter(value).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ userRoleFormatter(value, true).name }}</span>
                </span>
            </template>
            <template #col-last_accessed_at-format="{ value }">
                <span v-if="value === -1">
                    No Activity
                </span>
                <span v-else-if="value === 0">
                    {{ $t('IDENTITY.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="value === 1">
                    {{ $t('IDENTITY.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ value }} {{ $t('IDENTITY.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #col-tags-format="{value}">
                <template v-if="!!Object.keys(value).length">
                    <p-badge v-for="([key, val], idx) in Object.entries(value)"
                             :key="`${key}-${val}-${idx}`"
                             badge-type="subtle"
                             shape="square"
                             style-type="gray200"
                             class="mr-2"
                    >
                        {{ key }}: {{ val }}
                    </p-badge>
                </template>
                <template v-else>
                    <span />
                </template>
            </template>
            <template #col-role_binding_info-format="{value}">
                <p-button style-type="tertiary"
                          size="sm"
                          class="remove-button"
                          @click="handleClickButton(value)"
                >
                    {{ $t('IDENTITY.USER.MAIN.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.user-management-table {
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}
</style>
