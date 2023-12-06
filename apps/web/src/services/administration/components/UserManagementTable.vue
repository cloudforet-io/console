<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PBadge, PStatus, PToolboxTable, PI,
} from '@spaceone/design-system';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { UserCreateParameters } from '@/schema/identity/user/api-verbs/create';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementFormModal from '@/services/administration/components/UserManagementFormModal.vue';
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
import type { User } from '@/services/administration/types/user-type';

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
    visible: computed(() => userPageState.visibleStatusModal),
});
const userFormState = reactive({
    visible: computed(() => userPageState.visibleCreateModal || userPageState.visibleUpdateModal),
    updateMode: false,
    headerTitle: '',
    item: undefined as undefined | User,
    roleOfSelectedUser: '',
});

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
const handleUserFormConfirm = async (item, roleId) => {
    if (userFormState.updateMode) {
        await updateUser(item, roleId);
    } else {
        await addUser(item, roleId);
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

/* API */
let userListApiQuery = userListApiQueryHelper.data;
const addUser = async (item, roleId) => {
    userPageStore.$patch({
        modalLoading: true,
    });
    try {
        await SpaceConnector.clientV2.identity.user.create<UserCreateParameters>({
            ...item,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_ADD_USER'), '');
        if (roleId.length > 0 || roleId !== '') {
            await userPageStore.createRoleBinding({
                user_id: item.user_id,
                role_id: roleId,
                // TODO: will be changed after permission group is implemented
                permission_group: 'DOMAIN',
                domain_id: state.domain_id,
            });
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_ADD_USER'));
    } finally {
        userPageStore.$patch({
            selectedIndices: [],
            visibleCreateModal: false,
            modalLoading: false,
        });
    }
};
const updateUser = async (item, roleId) => {
    userPageStore.$patch({
        modalLoading: true,
    });
    try {
        await SpaceConnector.clientV2.identity.user.update({
            ...item,
        });
        if (roleId && roleId !== userFormState.roleOfSelectedUser) {
            await userPageStore.createRoleBinding({
                user_id: item.user_id,
                role_id: roleId,
                // TODO: will be changed after permission group is implemented
                permission_group: 'DOMAIN',
                domain_id: state.domain_id,
            });
            userFormState.roleOfSelectedUser = roleId;
        }
        if (!roleId && userFormState.roleOfSelectedUser !== '') {
            await userPageStore.listRoleBindings({
                user_id: item.user_id,
                domain_id: state.domain_id,
            });
            userFormState.roleOfSelectedUser = roleId;
        }
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
    } catch (e: any) {
        if (e.code === 'ERROR_UNABLE_TO_RESET_PASSWORD_IN_EXTERNAL_AUTH') {
            showErrorMessage(e.message, '');
        } else if (e.code === 'ERROR_PASSWORD_NOT_CHANGED') {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_SAME_PASSWORD'));
        } else {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
        }
    } finally {
        await userPageStore.listUsers({
            query: userListApiQuery,
            domain_id: state.domain_id,
        });
        userPageStore.$patch({
            selectedIndices: [],
            visibleUpdateModal: false,
            modalLoading: false,
        });
    }
};

/* Init */
(async () => {
    await userPageStore.listUsers({
        query: userListApiQuery,
        domain_id: state.domain_id,
    });
})();
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
        <user-management-form-modal v-if="userPageState.visibleCreateModal || userPageState.visibleUpdateModal"
                                    :header-title="userFormState.headerTitle"
                                    :item="userFormState.item"
                                    @confirm="handleUserFormConfirm"
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
