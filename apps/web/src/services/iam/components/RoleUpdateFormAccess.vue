<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { filter, find, isEqual } from 'lodash';

import {
    PI, PToggleButton, PDataTable, PSelectDropdown, PCheckboxGroup, PCheckbox, PHeading,
    useProxyValue,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { PAGE_ACCESS } from '@/lib/access-control/config';
import { getPageAccessMapFromRawData } from '@/lib/access-control/page-access-helper';
import { MENU_ID } from '@/lib/menu/config';

import { gray, green } from '@/styles/colors';

import { useRoleBasedMenus } from '@/services/iam/composables/role-based-menus';
import { useRoleGetQuery } from '@/services/iam/composables/use-role-get-query';
import { getPageAccessList, getPageAccessMenuListByRoleType } from '@/services/iam/helpers/role-page-access-menu-list';
import type { PageAccessMenuItem, RoleFormData, TableItem } from '@/services/iam/types/role-type';


interface Props {
    menuItems?: PageAccessMenuItem[]
    proxyPageAccessValid?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update', value: string[]): void,
    (e: 'update-form', formData: RoleFormData): void,
}>();

const router = useRouter();
const roleId: string = router.currentRoute.params.id;

const { roleData } = useRoleGetQuery(roleId);

const { roleBasedMenus } = useRoleBasedMenus();

const menuItems = ref([] as PageAccessMenuItem[]);
const state = reactive({
    pageAccessPermissions: computed(() => getPageAccessList(menuItems.value)),
    proxyPageAccessValid: useProxyValue('proxyPageAccessValid', props, emit),
    menuList: computed(() => roleBasedMenus.value),
    accessibleMenuList: computed<PageAccessMenuItem[]>(() => menuItems.value.flatMap((i) => i.subMenuList || [])),
    isReadOnly: false,
});

const tableState = reactive({
    fields: computed(() => [
        { name: 'service', label: i18n.t('IAM.ROLE.FORM.SERVICE'), width: '150px' },
        { name: 'page_access', label: i18n.t('IAM.ROLE.FORM.ACCESS'), width: '190px' },
        { name: 'accessible_menu_list', label: i18n.t('IAM.ROLE.FORM.ACCESSIBLE_MENU') },
    ]),
    items: computed<TableItem[]|undefined>(() => menuItems.value?.map((i) => ({
        id: i.id,
        service: i.translationIds ? i.translationIds[0] : '',
        page_access: i.isParent ? i.accessType : undefined,
        accessible_menu_list: i?.subMenuList,
        isInValid: i?.subMenuList?.every((j) => !j.isAccessible),
    }))),
    selectedMenuIds: [] as PageAccessMenuItem[],
});

/* Component */
const getDropdownItems = (id: string) => {
    if (id === MENU_ID.DASHBOARDS || id === MENU_ID.PROJECT) {
        return [
            { name: PAGE_ACCESS.WRITABLE, label: i18n.t('IAM.ROLE.FORM.READ_AND_WRITE'), icon: 'ic_edit' },
            { name: PAGE_ACCESS.RESTRICTED, label: i18n.t('IAM.ROLE.FORM.NO_ACCESS'), icon: 'ic_limit-filled' },
        ];
    }
    return [
        { name: PAGE_ACCESS.WRITABLE, label: i18n.t('IAM.ROLE.FORM.READ_AND_WRITE'), icon: 'ic_edit' },
        { name: PAGE_ACCESS.READONLY, label: i18n.t('IAM.ROLE.FORM.READ_ONLY'), icon: 'ic_no-edit' },
        { name: PAGE_ACCESS.RESTRICTED, label: i18n.t('IAM.ROLE.FORM.NO_ACCESS'), icon: 'ic_limit-filled' },
    ];
};
const handleChangeSelectedMenu = (values: PageAccessMenuItem[]) => {
    tableState.selectedMenuIds = values;

    const valueIds = new Set(values.map((i) => i.id));

    state.accessibleMenuList?.forEach((i) => {
        const isAccessible = valueIds.has(i.id);
        handleUpdateForm({
            ...i,
            isAccessible,
        });
    });

    menuItems.value.forEach((menuItem) => {
        if (menuItem?.subMenuList?.length) {
            menuItem.isValid = !menuItem?.subMenuList.every((d) => !d.isAccessible);
        }
    });

    state.proxyPageAccessValid = menuItems.value.every((i) => i.isValid);
};
const handleChangeSelectedAccess = (value: string, item: TableItem) => {
    handleUpdateForm({
        ...item,
        accessType: value,
        isAccessible: true,
    });

    tableState.selectedMenuIds = menuItems.value.flatMap((i) => filter(i.subMenuList, { isAccessible: true }));
};
const handleChangeToggle = (value: boolean) => {
    state.isReadOnly = value;
    menuItems.value.forEach((menu) => {
        handleUpdateForm({
            ...menu,
            accessType: value ? PAGE_ACCESS.READONLY : PAGE_ACCESS.WRITABLE,
        });
    });
};
const handleUpdateForm = (value: PageAccessMenuItem, isInit?: boolean) => {
    const { id: menuId, isAccessible, accessType } = value;
    const item = find(menuItems.value, { id: menuId });
    if (item) {
        if (accessType) {
            item.accessType = accessType;
            item.subMenuList?.forEach((d) => {
                d.isAccessible = true;
            });
        }
        if (isInit && item.subMenuList?.length === 0) {
            item.subMenuList?.push({
                id: item.id,
                isAccessible: item.isAccessible,
                translationIds: item.translationIds,
            });
        }
    }
    menuItems.value.forEach((menuItem) => {
        if (menuItem?.subMenuList?.length) {
            menuItem.isValid = !menuItem?.subMenuList.every((d) => !d.isAccessible);

            const subItem = find(menuItem.subMenuList, { id: menuId });
            if (subItem) {
                subItem.isAccessible = menuItem.accessType !== PAGE_ACCESS.RESTRICTED ? isAccessible : true;
            }
        }
    });

    state.proxyPageAccessValid = menuItems.value.every((i) => i.isValid);
};

const setPageAccessPermissionsData = () => {
    if (!roleData.value?.page_access) return;
    const pageAccessPermissionMap = getPageAccessMapFromRawData({
        pageAccessPermissions: roleData.value?.page_access, menuList: state.menuList,
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const [itemId, accessible] of Object.entries(pageAccessPermissionMap)) {
        if (!itemId) return;
        let accessType = '';
        if (accessible.read && accessible.write) {
            accessType = PAGE_ACCESS.WRITABLE;
        } else if (accessible.read && !accessible.write) {
            accessType = PAGE_ACCESS.READONLY;
        } else {
            accessType = PAGE_ACCESS.RESTRICTED;
        }
        handleUpdateForm({
            id: itemId,
            isAccessible: accessible.access,
            accessType,
        }, true);
    }
};

/* Watcher */
watch(() => roleData, () => {
    if (!roleData.value?.role_type) return;
    menuItems.value = getPageAccessMenuListByRoleType(roleData.value.role_type, state.menuList);
    setPageAccessPermissionsData();
}, { deep: true, immediate: true });

watch(() => menuItems, () => {
    state.isReadOnly = menuItems.value.every((i) => i.accessType === PAGE_ACCESS.READONLY);
    tableState.selectedMenuIds = menuItems.value.flatMap((i) => filter(i.subMenuList, { isAccessible: true }));
}, { deep: true, immediate: true });

watch(() => state.pageAccessPermissions, (pageAccessPermissions, prevPageAccessPermissions) => {
    if (isEqual(pageAccessPermissions, prevPageAccessPermissions)) return;
    emit('update-form', { page_access: pageAccessPermissions });
});
</script>

<template>
    <div class="role-update-page-access">
        <p-heading class="pt-8 pb-2"
                   heading-type="sub"
                   :title="$t('IAM.ROLE.DETAIL.PAGE_ACCESS')"
        />
        <div v-if="roleData?.role_type === ROLE_TYPE.DOMAIN_ADMIN">
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
            <div class="page-access-info-wrapper">
                <p-toggle-button :value="state.isReadOnly"
                                 @change-toggle="handleChangeToggle"
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
            <template #col-page_access-format="{value, item: pageAccessItem}">
                <p-select-dropdown :selected="value"
                                   class="menu-dropdown"
                                   :menu="getDropdownItems(pageAccessItem.id)"
                                   use-fixed-menu-style
                                   @select="handleChangeSelectedAccess($event, pageAccessItem)"
                >
                    <template #dropdown-button="item">
                        <p-i :name="item.icon"
                             width="1.25rem"
                             height="1.25rem"
                             color="inherit"
                        />
                        <span>{{ item.label }}</span>
                    </template>
                </p-select-dropdown>
            </template>
            <template #col-accessible_menu_list-format="{value, item}">
                <div>
                    <p-checkbox-group direction="horizontal">
                        <p-checkbox v-for="menu in value"
                                    :key="menu.name"
                                    :invalid="item.isInValid"
                                    class="accessible-item"
                                    :disabled="item.page_access === PAGE_ACCESS.RESTRICTED"
                                    :selected="tableState.selectedMenuIds"
                                    :value="menu"
                                    @change="handleChangeSelectedMenu"
                        >
                            {{ $t(menu.translationIds[0]) }}
                        </p-checkbox>
                        <p v-if="item.isInValid"
                           class="invalid"
                        >
                            {{ $t('IAM.ROLE.FORM.ALT_E_SELECT') }}
                        </p>
                    </p-checkbox-group>
                </div>
            </template>
        </p-data-table>
    </div>
</template>

<style scoped lang="postcss">
.role-update-page-access {
    @apply flex flex-col;
    margin: 0 1rem 0.5rem 1rem;
    gap: 0.5rem;
    .page-access-menu {
        @apply border border-gray-200 rounded-md;
        font-size: 0.875rem;
        line-height: 1.25;
        .menu-dropdown {
            min-width: 9.5rem;
        }
        .invalid {
            @apply text-label-sm text-alert;
        }
    }

    /* custom design-system component - p-text-input */
    &:deep(.p-data-table) {
        th {
            border-top: none;
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
            &:last-child {
                td {
                    border-bottom: none;
                }
            }
        }
    }
    .page-access-info-wrapper {
        @apply flex items-start border border-gray-200 rounded-md;
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
}
</style>
