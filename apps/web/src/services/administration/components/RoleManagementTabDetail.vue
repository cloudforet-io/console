<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PDefinitionTable, PHeading, PI,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { iso8601Formatter } from '@cloudforet/utils';

import type { RoleModel } from '@/schema/identity/role/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import type { PagePermission } from '@/lib/access-control/config';

import {
    usePageAccessDefinitionTableData,
} from '@/services/administration/composables/page-access-definition-table-data';
import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

type DataTableTranslationField = DataTableField | {
    label?: TranslateResult | string;
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
        name: 'base_information',
        label: i18n.t('IAM.ROLE.DETAIL.BASE_INFORMATION') as string,
        fields: [
            { name: 'name', label: i18n.t('IAM.ROLE.DETAIL.NAME') },
            { name: 'role_type', label: i18n.t('IAM.ROLE.DETAIL.ROLE_TYPE'), disableCopy: true },
            { name: 'created_at', label: i18n.t('IAM.ROLE.DETAIL.CREATED_AT') },
        ],
    },
    {
        name: 'page_access',
        label: i18n.t('IAM.ROLE.DETAIL.PAGE_ACCESS') as string,
    },
    {
        name: 'api_policy',
        label: i18n.t('IAM.ROLE.DETAIL.API_POLICY') as string,
    },
]);

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    data: {} as Partial<RoleModel>,
    selectedRole: computed<RoleModel>(() => rolePageStore.selectedRoles[0]),
    permissionScopes: computed<string[]>(() => state.data?.permission_scopes ?? []),
    pageAccess: computed<PagePermission[]>(() => state.data?.page_access ?? []),
    pageAccessDataList: usePageAccessDefinitionTableData(computed(() => state.pageAccess ?? [])),
});

/* Api */
const getRoleDetailData = async (roleId) => {
    state.loading = true;
    try {
        state.data = await rolePageStore.getRoleDetail({ role_id: roleId });
    } catch (e) {
        state.data = {};
    } finally {
        state.loading = false;
    }
};
// TODO: need to refacotor with new design
// const convertPagePermissionLabel = (data) => {
//     switch (data) {
//     case PAGE_PERMISSION_TYPE.MANAGE:
//         return i18n.t('IAM.ROLE.FORM.MANAGE');
//     case PAGE_PERMISSION_TYPE.VIEW:
//         return i18n.t('IAM.ROLE.FORM.VIEW');
//     default:
//         return '--';
//     }
// };
const convertPagePermissionLabel = (accessible) => accessible;

/* Watcher */
watch(() => state.selectedRole.role_id, async (roleId) => {
    const selectedRoleId = rolePageStore.selectedRoles.length === 0 && rolePageState.selectedIndices.length !== 0
        ? rolePageState.roles[rolePageState.selectedIndices[0]].role_id
        : roleId;
    await getRoleDetailData(selectedRoleId);
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
                <p-definition-table v-if="item.name === 'base_information'"
                                    :fields="item.fields"
                                    :data="state.data"
                                    :loading="state.loading"
                                    :skeleton-rows="4"
                                    class="base-information-table"
                                    v-on="$listeners"
                >
                    <template #data-created_at="{ data }">
                        {{ iso8601Formatter(data, storeState.timezone) }}
                    </template>
                    <template #data-role_type="{ data }">
                        <span class="role-type">
                            <img :src="useRoleFormatter(data).image"
                                 alt="role-type-icon"
                                 class="role-type-icon"
                            >
                            <span>{{ useRoleFormatter(data).name }}</span>
                        </span>
                    </template>
                </p-definition-table>
                <div v-for="pageAccessData in state.pageAccessDataList"
                     v-else-if="item.name === 'page_access'"
                     :key="pageAccessData.label"
                     class="page-access-table-wrapper"
                >
                    <h4 class="definition-table-header">
                        {{ pageAccessData.label }}
                    </h4>
                    <p-definition-table :fields="pageAccessData.fields"
                                        :data="pageAccessData.data"
                                        :loading="state.loading"
                                        :skeleton-rows="3"
                                        disable-copy
                                        class="page-access-table"
                                        v-on="$listeners"
                    >
                        <template #data="{ data }">
                            {{ convertPagePermissionLabel(data) }}
                        </template>
                    </p-definition-table>
                </div>
                <div v-else-if="item.name === 'api_policy'"
                     class="api-policy-table"
                >
                    <div v-if="state.permissionScopes.length === 0"
                         class="has-all-permissions"
                    >
                        <p-i name="ic_plugs"
                             width="2rem"
                             height="2rem"
                             color="inherit"
                        />
                        <span class="text">
                            {{ $t('IAM.ROLE.DETAIL.ALL_PERMISSIONS') }}
                        </span>
                    </div>
                    <!-- TODO: will be updated after API is ready-->
                    <div v-else>
                        temp
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
        .base-information-table {
            min-height: unset;
            .role-type {
                @apply flex items-center;
                gap: 0.5rem;
                .role-type-icon {
                    @apply rounded-full;
                    width: 1rem;
                    height: 1rem;
                }
            }
        }
        .page-access-table-wrapper {
            .definition-table-header {
                @apply ml-4 mb-3 text-violet-700 font-bold;
            }
            .page-access-table {
                min-height: unset;
                margin-bottom: 1rem;
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
