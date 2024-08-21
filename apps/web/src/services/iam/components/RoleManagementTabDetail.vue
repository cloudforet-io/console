<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PI, PTextEditor, PEmpty, PDataTable,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import type { RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { getPageAccessPermissionMapFromRawData } from '@/lib/access-control/page-access-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { MANAGED_PAGE_ACCESS } from '@/services/iam/constants/role-constant';
import { getPageAccessMenuListByRoleType } from '@/services/iam/helpers/role-page-access-menu-list';
import { useRolePageStore } from '@/services/iam/store/role-page-store';
import type { PageAccessMenuItem, TableItem, AccessType } from '@/services/iam/types/role-type';

type DataTableTranslationField = DataTableField | { label?: string };
interface DetailMenuItems {
    name: string;
    label: string;
    fields?: DataTableTranslationField[];
}

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const detailMenuItems = computed<DetailMenuItems[]>(() => [
    { name: 'page_access', label: i18n.t('IAM.ROLE.DETAIL.PAGE_ACCESS') as string },
    { name: 'api_policy', label: i18n.t('IAM.ROLE.DETAIL.API_POLICY') as string },
]);

const state = reactive({
    loading: false,
    data: {} as Partial<RoleModel>,
    selectedRole: computed<RoleModel>(() => rolePageStore.selectedRoles[0]),
    permissions: computed<string[]>(() => state.data?.permissions ?? []),
    permissionsCode: computed<string>(() => JSON.stringify(state.permissions, null, 4)),
    pageAccess: computed<string[]>(() => (state.data.is_managed ? MANAGED_PAGE_ACCESS : state.data.page_access ?? [])),
    pageAccessDataList: [] as PageAccessMenuItem[],
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'service', label: i18n.t('IAM.ROLE.FORM.SERVICE') },
        { name: 'page_access', label: i18n.t('IAM.ROLE.FORM.ACCESS') },
        { name: 'accessible_menu_list', label: i18n.t('IAM.ROLE.FORM.ACCESSIBLE_MENU') },
    ]),
    items: computed<TableItem[] | undefined>(() => state.pageAccessDataList?.map((i) => {
        const pageAccess: AccessType | undefined = (() => {
            if (i.isParent && i.subMenuList.length === 0) {
                return getAccessType('no_access');
            }
            if (i.accessType) {
                return getAccessType(i.accessType);
            }
            return undefined;
        })();

        return {
            id: i.id,
            service: i.translationIds ? i.translationIds[0] : '',
            page_access: pageAccess,
            accessible_menu_list: i.subMenuList.length > 0 ? i.subMenuList : undefined,
            isInValid: i.subMenuList.every((j) => !j.isAccessible),
        };
    })),
});

const getAccessType = (id: string): AccessType | undefined => {
    const accessTypes: Record<string, AccessType> = {
        read_write: { label: i18n.t('IAM.ROLE.FORM.READ_AND_WRITE'), icon: 'ic_edit' },
        read_only: { label: i18n.t('IAM.ROLE.FORM.READ_ONLY'), icon: 'ic_no-edit' },
        no_access: { label: i18n.t('IAM.ROLE.FORM.NO_ACCESS'), icon: 'ic_limit-filled' },
    };
    return accessTypes[id];
};
const handleUpdateForm = (value: PageAccessMenuItem) => {
    const { id: menuId, isAccessible, accessType } = value;
    const item = find(state.pageAccessDataList, { id: menuId });

    if (item) {
        if (accessType) item.accessType = accessType;
        if (item.subMenuList?.length === 0) {
            item.subMenuList?.push({
                id: item.id,
                isAccessible: item.isAccessible,
                translationIds: item.translationIds,
            });
        }
    }

    state.pageAccessDataList.forEach((menuItem) => {
        const subItem = find(menuItem.subMenuList, { id: menuId });
        if (subItem) subItem.isAccessible = isAccessible;
    });
};

const getRoleDetailData = async (roleId: string) => {
    state.loading = true;
    try {
        state.data = await SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>({ role_id: roleId });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = {};
    } finally {
        state.loading = false;
    }
};

watch(() => state.selectedRole.role_id, async (roleId) => {
    const selectedRoleId = rolePageStore.selectedRoles.length === 0 && rolePageState.selectedIndices.length !== 0
        ? rolePageState.roles[rolePageState.selectedIndices[0]].role_id
        : roleId;

    await getRoleDetailData(selectedRoleId);
    state.pageAccessDataList = getPageAccessMenuListByRoleType(state.data.role_type);

    const pageAccessPermissionMap = getPageAccessPermissionMapFromRawData(state.pageAccess);

    Object.entries(pageAccessPermissionMap).forEach(([itemId, accessible]) => {
        handleUpdateForm({ id: itemId, isAccessible: accessible });
    });
}, { immediate: true });
</script>

<template>
    <div class="role-management-tab-detail">
        <div v-for="(item, idx) in detailMenuItems"
             :key="`detail-menu-item-${idx}`"
        >
            <p-heading heading-type="sub"
                       :title="item.label"
            />
            <div class="detail-menu-content">
                <div v-if="item.name === 'page_access'">
                    <p-empty v-if="state.pageAccessDataList.length === 0">
                        {{ $t('IAM.ROLE.DETAIL.NO_DATA') }}
                    </p-empty>
                    <p-data-table v-else
                                  :fields="tableState.fields"
                                  :items="tableState.items"
                                  class="page-access-menu"
                    >
                        <template #col-service-format="{value}">
                            <span>{{ $t(value) }}</span>
                        </template>
                        <template #col-page_access-format="{value}">
                            <div class="col-page-access">
                                <p-i :name="value.icon"
                                     width="1.25rem"
                                     height="1.25rem"
                                     color="inherit"
                                />
                                <span>{{ value.label }}</span>
                            </div>
                        </template>
                        <template #col-accessible_menu_list-format="{value}">
                            <p v-if="value && value.length > 0">
                                <span v-for="(menu, index) in value"
                                      :key="menu.name"
                                      class="accessible-item"
                                >
                                    {{ $t(menu.translationIds[0]) }}
                                    <span v-if="index < value.length - 1">, </span>
                                </span>
                            </p>
                        </template>
                    </p-data-table>
                </div>
                <div v-else-if="item.name === 'api_policy'"
                     class="api-policy-table"
                >
                    <div v-if="state.permissions.length === 0"
                         class="has-all-permissions"
                    >
                        <p-i name="ic_plugs"
                             width="2rem"
                             height="2rem"
                             color="inherit"
                        />
                        <span class="text">
                            {{ $t('IAM.ROLE.FORM.DEFAULT_API_POLICY_HELP_TEXT') }}
                        </span>
                    </div>
                    <div v-else>
                        <p-text-editor :code="state.permissionsCode"
                                       class="content-wrapper"
                                       read-only
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.role-management-tab-detail {
    @apply flex flex-col;
    gap: 0.625rem;
    .detail-menu-content {
        .col-page-access {
            @apply flex;
            gap: 0.25rem;
        }
        .page-access-menu {
            @apply border border-gray-200 rounded-md;
            font-size: 0.875rem;
            line-height: 1.25;
            .accessible-item {
                @apply inline-flex;
                & + .accessible-item {
                    margin-left: 0.5rem;
                }
            }
        }

        /* custom design-system component - p-text-input */
        &:deep(.p-data-table) {
            border: none;
            border-radius: initial;
            th {
                &:first-child {
                    @apply bg-gray-100;
                }
            }
            tr {
                &:hover {
                    @apply bg-transparent;
                }
                td {
                    height: initial;
                    padding-top: 0.625rem;
                    padding-bottom: 0.625rem;
                    &:first-child {
                        @apply bg-gray-100;
                    }
                }
            }
        }
        .api-policy-table {
            padding-right: 1rem;
            padding-left: 1rem;
            .has-all-permissions {
                @apply flex items-center border border-gray-200 rounded-md;
                padding: 1rem;
                gap: 0.5rem;
            }
        }
    }
}

</style>
