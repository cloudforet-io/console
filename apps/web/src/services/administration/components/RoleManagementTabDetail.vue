<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PHeading, PI, PTextEditor, PEmpty,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import type { RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { getPageAccessPermissionMapFromRawData } from '@/lib/access-control/page-access-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red } from '@/styles/colors';

import { MANAGED_PAGE_ACCESS } from '@/services/administration/constants/role-constant';
import { getPageAccessMenuListByRoleType } from '@/services/administration/helpers/role-page-access-menu-list';
import { useRolePageStore } from '@/services/administration/store/role-page-store';
import type { PageAccessMenuItem, UpdateFormDataType } from '@/services/administration/types/role-type';

type DataTableTranslationField = DataTableField | {
    label?: string;
};
interface DetailMenuItems {
    name: string;
    label: string;
    fields?: DataTableTranslationField[];
}

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const detailMenuItems = computed<DetailMenuItems[]>(() => [
    {
        name: 'page_access',
        label: i18n.t('IAM.ROLE.DETAIL.PAGE_ACCESS') as string,
    },
    {
        name: 'api_policy',
        label: i18n.t('IAM.ROLE.DETAIL.API_POLICY') as string,
    },
]);
const state = reactive({
    loading: false,
    data: {} as Partial<RoleModel>,
    selectedRole: computed<RoleModel>(() => rolePageStore.selectedRoles[0]),
    permissions: computed<string[]>(() => state.data?.permissions ?? []),
    permissionsCode: computed<string>(() => JSON.stringify(state.permissions, null, 4)),
    pageAccess: computed<string[]>(() => {
        if (state.data.is_managed) {
            return MANAGED_PAGE_ACCESS;
        }
        return state.data.page_access ?? [];
    }),
    pageAccessDataList: [] as PageAccessMenuItem[],
});

/* Component */
const updateMenuItems = (item: PageAccessMenuItem, val: boolean, parentItem?: PageAccessMenuItem) => {
    item.isAccessible = val;
    if (parentItem && !val) parentItem.isAccessible = val;
    if (item?.subMenuList?.length) {
        item.subMenuList.forEach((subMenu) => {
            subMenu.isAccessible = val;
        });
    }
};
const handleUpdateForm = (value: UpdateFormDataType) => {
    const { id: menuId, val } = value;
    const item = find(state.pageAccessDataList, { id: menuId });
    if (item) {
        updateMenuItems(item, val);
    } else {
        state.pageAccessDataList.forEach((menuItem) => {
            if (menuItem?.subMenuList?.length) {
                const subItem = find(menuItem.subMenuList, { id: menuId });
                if (subItem) {
                    updateMenuItems(subItem, val, menuItem);
                    if (menuItem.subMenuList.every((d) => d.isAccessible)) updateMenuItems(menuItem, val);
                }
            }
        });
    }
};

/* Api */
const getRoleDetailData = async (roleId) => {
    state.loading = true;
    try {
        state.data = await SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>({
            role_id: roleId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = {};
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => state.selectedRole.role_id, async (roleId) => {
    const selectedRoleId = rolePageStore.selectedRoles.length === 0 && rolePageState.selectedIndices.length !== 0
        ? rolePageState.roles[rolePageState.selectedIndices[0]].role_id
        : roleId;
    await getRoleDetailData(selectedRoleId);
    state.pageAccessDataList = getPageAccessMenuListByRoleType([], state.data.role_type);

    const pageAccessPermissionMap = getPageAccessPermissionMapFromRawData(state.pageAccess);
    // eslint-disable-next-line no-restricted-syntax
    for (const [itemId, accessible] of Object.entries(pageAccessPermissionMap)) {
        handleUpdateForm({ id: itemId, val: accessible });
    }
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
                    <div v-else
                         class="page-access-table"
                    >
                        <div class="page-access-menu">
                            <div class="header-wrapper">
                                <span class="left-part">{{ $t('IAM.ROLE.FORM.MENU') }}</span>
                                <span class="right-part mr-6">{{ $t('IAM.ROLE.FORM.ACCESS') }}</span>
                            </div>
                            <div class="content-wrapper">
                                <div v-for="menu in state.pageAccessDataList"
                                     :key="`page-access-data-${menu.id}`"
                                     class="menu-wrapper"
                                     :class="menu.id"
                                >
                                    <div class="menu-view">
                                        <span v-for="(translationId) in menu.translationIds"
                                              :key="translationId"
                                              class="page-access-menu-item"
                                              :class="[menu.isParent ? 'parent' : '', menu.id]"
                                        >
                                            {{ $t(translationId) }}
                                        </span>
                                        <div v-if="menu.subMenuList.length === 0"
                                             class="icon-wrapper"
                                        >
                                            <p-i v-if="menu.isAccessible"
                                                 name="ic_check"
                                                 height="1rem"
                                                 width="1rem"
                                                 class="check-icon"
                                                 :color="green[500]"
                                            />
                                            <p-i v-else
                                                 name="ic_limit-filled"
                                                 height="1rem"
                                                 width="1rem"
                                                 class="check-icon"
                                                 :color="red[300]"
                                            />
                                        </div>
                                    </div>
                                    <div v-for="subMenu in menu.subMenuList"
                                         :key="subMenu.id"
                                         class="sub-menu-wrapper"
                                    >
                                        <div class="menu-view">
                                            <span v-for="(translationId) in subMenu.translationIds"
                                                  :key="translationId"
                                                  class="page-access-menu-item"
                                                  :class="[menu.isParent ? 'parent' : '', menu.id]"
                                            >
                                                {{ $t(translationId) }}
                                            </span>
                                            <p-i v-if="subMenu.isAccessible"
                                                 name="ic_check"
                                                 height="1rem"
                                                 width="1rem"
                                                 class="check-icon"
                                                 :color="green[500]"
                                            />
                                            <p-i v-else
                                                 name="ic_limit-filled"
                                                 height="1rem"
                                                 width="1rem"
                                                 class="check-icon"
                                                 :color="red[300]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
        .page-access-table {
            @apply flex flex-col;
            max-width: 43.5rem;
            margin-left: 1rem;
            gap: 0.5rem;
            .page-access-menu {
                @apply text-label-md border border-gray-200 rounded-md;
                .header-wrapper {
                    @apply flex text-label-sm text-gray-500 border-b border-gray-200;
                    padding: 0.5rem 1rem;
                }
                .content-wrapper {
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                }
                .menu-wrapper {
                    @apply bg-gray-100 border border-gray-200 rounded-md;
                    margin: 0.5rem 1rem;
                    padding-right: 0.5rem;
                    padding-left: 0.5rem;
                    .menu-view {
                        @apply flex items-center justify-between;
                        .icon-wrapper {
                            margin-right: 1.5rem;
                        }
                    }
                    .sub-menu-wrapper {
                        @apply bg-white rounded-md;
                        margin-top: 0.25rem;
                        margin-bottom: 0.25rem;
                        padding-right: 1.5rem;
                        .page-access-menu-item {
                            @apply text-gray-700;
                            padding-left: 1.625rem;
                        }
                    }
                    .page-access-menu-item {
                        @apply flex items-center;
                        height: 3rem;
                    }
                }
                .left-part {
                    flex-grow: 1;
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
