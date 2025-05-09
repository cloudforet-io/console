<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PI, PCodeEditor, PEmpty, PDataTable,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleGetParameters } from '@/api-clients/identity/role/schema/api-verbs/get';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { i18n } from '@/translations';

import { useMenuStore } from '@/store/menu/menu-store';

import { PAGE_ACCESS } from '@/lib/access-control/config';
import {
    getPageAccessMapFromRawData,
} from '@/lib/access-control/page-access-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, green } from '@/styles/colors';

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
const menuStore = useMenuStore();

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
    readOnly: computed<boolean>(() => state.data.page_access.every((item) => {
        const accessType = item.split('.*')[0].split(':')[1];
        return accessType === PAGE_ACCESS.READONLY;
    })),
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'service', label: i18n.t('IAM.ROLE.FORM.SERVICE'), width: '150px' },
        { name: 'page_access', label: i18n.t('IAM.ROLE.FORM.ACCESS'), width: '160px' },
        { name: 'accessible_menu_list', label: i18n.t('IAM.ROLE.FORM.ACCESSIBLE_MENU') },
    ]),
    items: computed<TableItem[] | undefined>(() => state.pageAccessDataList?.map((i) => {
        const pageAccess: AccessType | undefined = (() => {
            if (i.isParent && i.subMenuList.length === 0) {
                return getAccessType(PAGE_ACCESS.RESTRICTED);
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
        };
    })),
});

const getAccessType = (id: string): AccessType | undefined => {
    const accessTypes: Record<string, AccessType> = {
        writable: { label: i18n.t('IAM.ROLE.FORM.READ_AND_WRITE'), icon: 'ic_edit' },
        readonly: { label: i18n.t('IAM.ROLE.FORM.READ_ONLY'), icon: 'ic_no-edit' },
        restricted: { label: i18n.t('IAM.ROLE.FORM.NO_ACCESS'), icon: 'ic_limit-filled' },
    };
    return accessTypes[id];
};
const handleUpdateForm = (value: PageAccessMenuItem) => {
    const { id: menuId, isAccessible, accessType } = value;
    const item = find(state.pageAccessDataList, { id: menuId });

    if (item) {
        if (accessType) item.accessType = accessType;
        if (item.accessType === PAGE_ACCESS.RESTRICTED) {
            item.subMenuList = [];
        } else if (item.subMenuList?.length === 0) {
            item.subMenuList?.push({
                id: item.id,
                isAccessible: item.isAccessible,
                translationIds: item.translationIds,
            });
        }
    }

    state.pageAccessDataList.forEach((menuItem) => {
        if (menuItem?.subMenuList?.length) {
            const subItemIndex = menuItem.subMenuList.findIndex((d) => d.id === menuId);

            if (subItemIndex !== -1 && !isAccessible) {
                menuItem.subMenuList.splice(subItemIndex, 1);
            }
        }
        return menuItem;
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

    const pageAccessPermissionMap = getPageAccessMapFromRawData({
        pageAccessPermissions: state.pageAccess, isRolePage: true, menuList: menuStore.getters.menuList,
    });

    Object.entries(pageAccessPermissionMap).forEach(([itemId, accessible]) => {
        if (!itemId) return;
        let accessType = '';
        if (accessible.read && accessible.write) {
            accessType = PAGE_ACCESS.WRITABLE;
        } else if (accessible.read && !accessible.write) {
            accessType = PAGE_ACCESS.READONLY;
        } else {
            accessType = PAGE_ACCESS.RESTRICTED;
        }
        handleUpdateForm({ id: itemId, isAccessible: accessible.access, accessType });
    });
}, { immediate: true });
</script>

<template>
    <div class="role-management-tab-detail">
        <div v-for="(item, idx) in detailMenuItems"
             :key="`detail-menu-item-${idx}`"
        >
            <p-heading class="pt-8 px-4 pb-4"
                       heading-type="sub"
                       :title="item.label"
            />
            <div class="detail-menu-content">
                <div v-if="item.name === 'page_access'">
                    <p-empty v-if="state.pageAccessDataList.length === 0">
                        {{ $t('IAM.ROLE.DETAIL.NO_DATA') }}
                    </p-empty>
                    <div v-else-if="state.data.role_type === ROLE_TYPE.DOMAIN_ADMIN">
                        <div class="page-access-info-wrapper">
                            <p-i name="ic_settings"
                                 width="2rem"
                                 height="2rem"
                                 class="setting-icon"
                                 :color="gray[900]"
                            />
                            <div class="page-access-info">
                                <p class="title">
                                    {{ $t('IAM.ROLE.FORM.FULL_ACCESS') }}
                                </p>
                                <div class="page-access-desc">
                                    <p-i name="ic_check-circle"
                                         width="1.125rem"
                                         height="1.125rem"
                                         class="check-circle-icon"
                                         :color="green[600]"
                                    />
                                    <span class="desc">{{ $t('IAM.ROLE.FORM.ADMIN_CENTER') }}</span>
                                </div>
                                <div class="page-access-desc">
                                    <p-i name="ic_check-circle"
                                         width="1.125rem"
                                         height="1.125rem"
                                         class="check-circle-icon"
                                         :color="green[600]"
                                    />
                                    <span class="desc">{{ $t('IAM.ROLE.FORM.ALL_WORKSPACES') }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="state.readOnly"
                             class="page-access-info-wrapper"
                        >
                            <p-i name="ic_no-edit"
                                 height="2rem"
                                 width="2rem"
                                 color="inherit"
                            />
                            <span>{{ $t('IAM.ROLE.FORM.READ_ONLY_PERMISSIONS') }}</span>
                        </div>
                    </div>
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
                        <p-code-editor :code="state.permissionsCode"
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
        .page-access-info-wrapper {
            @apply flex items-start border border-gray-200 rounded-md;
            margin-right: 1rem;
            margin-left: 1rem;
            padding: 1.375rem 1rem;
            gap: 0.5rem;
            .setting-icon {
                margin-top: -0.375rem;
            }
            .page-access-info {
                @apply flex flex-col;
                gap: 0.25rem;
                .title {
                    @apply text-gray-900 font-medium;
                    margin-bottom: 0.375rem;
                }
                .desc {
                    @apply text-label-md text-gray-700;
                }
            }
            & + .page-access-info-wrapper {
                @apply items-center;
                margin-top: 0.5rem;
                padding-top: 1rem;
                padding-bottom: 1rem;
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
