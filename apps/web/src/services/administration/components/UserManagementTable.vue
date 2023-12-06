<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PBadge, PStatus, PToolboxTable, PI,
} from '@spaceone/design-system';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { replaceUrlQuery } from '@/lib/router-query-string';


import UserManagementStatusModal
    from '@/services/administration/components/UserManagementStatusModal.vue';
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

const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
    // TODO: will be removed after the backend is ready
    domain_id: computed(() => store.state.domain.domainId),
});
const tableState = reactive({
    refinedUserItems: computed(() => userPageState.users.map((user) => ({
        ...user,
        mfa: user.mfa && user.mfa.state === 'ENABLED' ? 'ON' : 'OFF',
        last_accessed_at: calculateTime(user.last_accessed_at, state.timezone),
    }))),
    isSelected: computed(() => userPageState.selectedIndices.length > 0),
    keyItemSets: USER_SEARCH_HANDLERS.keyItemSets as KeyItemSet[],
    valueHandlerMap: USER_SEARCH_HANDLERS.valueHandlerMap,
    tags: userListApiQueryHelper.setKeyItemSets(USER_SEARCH_HANDLERS.keyItemSets).queryTags,
});
const modalState = reactive({
    mode: '',
    title: '',
    subTitle: '',
    themeColor: undefined as string | undefined,
    visible: computed(() => userPageState.modalVisible.status),
});

let userListApiQuery = userListApiQueryHelper.data;

/* Component */
const handleSelect = async (index) => {
    userPageStore.$patch({ selectedIndices: index });
};
const handleChange = async (options: any = {}) => {
    userListApiQuery = getApiQueryWithToolboxOptions(userListApiQueryHelper, options) ?? userListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', userListApiQueryHelper.rawQueryStrings);
    }
    await userPageStore.listUsers({
        query: userListApiQuery,
        domain_id: state.domain_id,
    });
};
const handleUserStatusModalConfirm = () => {
    userPageStore.listUsers({
        query: userListApiQuery,
        domain_id: state.domain_id,
    });
};

/* Watcher */
watch(() => state.isAdminMode, async (isAdminMode) => {
    const params = {
        query: userListApiQuery,
        domain_id: state.domain_id,
    };
    if (isAdminMode) {
        await userPageStore.listUsers(params);
    } else {
        await userPageStore.listWorkspaceUsers(params);
    }
}, { immediate: true });
</script>

<template>
    <section class="user-management-table">
        <p-toolbox-table
            search-type="query"
            searchable
            selectable
            sortable
            :loading="userPageState.loading.list"
            :items="tableState.refinedUserItems"
            :select-index="userPageState.selectedIndices"
            :fields="USER_TABLE_FIELDS"
            sort-by="name"
            :sort-desc="true"
            :total-count="userPageState.totalCount"
            :key-item-sets="tableState.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"
            :query-tags="tableState.tags"
            :style="{height: `${props.tableHeight}px`}"
            @select="handleSelect"
            @change="handleChange"
            @refresh="handleChange()"
        >
            <template #toolbox-left>
                <user-management-table-toolbox v-if="state.isAdminMode" />
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
                    <p-i :name="userRoleFormatter(value).image"
                         width="1.5rem"
                         height="1.5rem"
                         class="role-type-icon"
                    />
                    <span>{{ userRoleFormatter(value).name }}</span>
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
        </p-toolbox-table>
        <user-management-status-modal v-if="modalState.visible"
                                      :header-title="modalState.title"
                                      :sub-title="modalState.subTitle"
                                      :theme-color="modalState.themeColor"
                                      :mode="modalState.mode"
                                      @confirm="handleUserStatusModalConfirm()"
        />
    </section>
</template>

<style lang="postcss" scoped>
.left-toolbox-item {
    min-width: 6.5rem;
    margin-left: 1rem;
    &:last-child {
        flex-grow: 1;
    }
}
.role-type {
    @apply flex items-center;
    gap: 0.5rem;
    .role-type-icon {
        @apply rounded-full;
    }
}
</style>
