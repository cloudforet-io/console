<template>
    <div>
        <p-panel-top>{{ title }}</p-panel-top>
        <p-definition-table :fields="fields" :data="data" :loading="loading"
                            :skeleton-rows="4" v-on="$listeners"
        >
            <template #data-created_at="{ data }">
                {{ iso8601Formatter(data, timezone) }}
            </template>
            <template #data-role_type="{ data }">
                <p-badge v-if="data" :outline="true" :style-type="ROLE_TYPE_BADGE_OPTION[data].styleType">
                    {{ ROLE_TYPE_BADGE_OPTION[data] ? ROLE_TYPE_BADGE_OPTION[data].label : '' }}
                </p-badge>
            </template>
        </p-definition-table>
        <p-panel-top>{{ pageAccessState.title }}</p-panel-top>
        <div v-for="pagePermissionState in pageAccessState.pagePermissionStates" :key="pagePermissionState.id">
            <h4 class="definition-table-header">
                {{ pagePermissionState.label }}
            </h4>
            <p-definition-table :fields="pagePermissionState.fields" :data="pagePermissionState.data" :loading="pageAccessState.loading"
                                :skeleton-rows="3" disable-copy v-on="$listeners"
            >
                <template #data="{ data }">
                    {{ convertPagePermissionLabel(data) }}
                </template>
            </p-definition-table>
        </div>
        <p-panel-top>{{ $t('IAM.ROLE.DETAIL.API_POLICY') }}</p-panel-top>
        <p-data-table :fields="policyState.fields"
                      :items="policyState.items"
                      :loading="loading"
                      :sortable="true"
                      sort-by="name"
                      :sort-desc="true"
        >
            <template #col-policy_type-format="{ value }">
                <p-badge outline :style-type="policyTypeBadgeColorFormatter(value)">
                    {{ value }}
                </p-badge>
            </template>
            <template #col-policy_id-format="{ value }">
                <p-anchor :highlight="true">
                    {{ value }}
                </p-anchor>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PPanelTop, PDefinitionTable, PBadge, PDataTable, PAnchor,
} from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import { i18n } from '@/translations';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import { EXCEPTION_MENU, ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import { RoleData } from '@/services/administration/iam/role/type';
import { MENU_ID, MenuId } from '@/lib/menu/config';
import {
    DataTableField,
} from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { TranslateResult } from 'vue-i18n';
import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import {
    getPagePermissionMap, PAGE_PERMISSION_TYPE, PagePermissionType,
} from '@/lib/access-control/page-permission-helper';
import { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';
import { policyTypeBadgeColorFormatter } from '@/services/administration/iam/policy/lib/helper';
import { GNBMenu } from '@/store/modules/display/type';
import { DefinitionField } from '@spaceone/design-system/dist/src/data-display/tables/definition-table/type';

type DataTableTranslationField = DataTableField | {
    label?: TranslateResult | string;
}

type PageAccessDataState = Record<string, PagePermissionType | '--'>;

interface PageAccessState extends GNBMenu {
    data?: PageAccessDataState;
    fields?: DefinitionField[];
}
export default {
    name: 'UserDetail',
    components: {
        PDefinitionTable,
        PPanelTop,
        PBadge,
        PDataTable,
        PAnchor,
    },
    props: {
        roleId: {
            type: String,
            required: true,
            default: '',
        },
    },
    setup(props) {
        const baseInfoState = reactive({
            title: computed(() => i18n.t('IAM.ROLE.DETAIL.BASE_INFORMATION')),
            loading: true,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            fields: computed<DataTableTranslationField[]>(() => [
                { name: 'name', label: i18n.t('IAM.ROLE.DETAIL.NAME') },
                { name: 'tag.description', label: i18n.t('IAM.ROLE.DETAIL.DESCRIPTION') },
                { name: 'role_type', label: i18n.t('IAM.ROLE.DETAIL.ROLE_TYPE'), disableCopy: true },
                { name: 'created_at', label: i18n.t('IAM.ROLE.DETAIL.CREATED_AT') },
            ]),
            data: {} as Partial<RoleData>,
        });

        const pageAccessState = reactive({
            title: i18n.t('IAM.ROLE.DETAIL.PAGE_ACCESS'),
            loading: false,
            allMenuList: computed<GNBMenu[]>(() => {
                const allMenu = store.getters['display/allGnbMenuList'];
                return (allMenu ?? []).filter(d => !EXCEPTION_MENU.includes(d.id));
            }),
            pagePermissionStates: [] as PageAccessState[],
        });
        const policyState = reactive({
            fields: [
                { name: 'name', label: 'Policy Name' },
                { name: 'policy_type', label: 'Policy Type' },
                { name: 'policy_id', label: 'Policy ID', sortable: false },
                { name: 'tags.description', label: 'Policy Description', sortable: false },
            ] as DataTableField[],
            items: [] as (PolicyDataModel | { policy_type: POLICY_TYPES })[],
        });

        const initPageAccessData = (pageAccessDataList: PageAccessState[]): PageAccessState[] => pageAccessDataList.map((pageAccessData) => {
            const multiDepthMenuList = [MENU_ID.ADMINISTRATION] as MenuId[];
            const subMenu = pageAccessData.subMenuList;
            if (!pageAccessData?.data || !subMenu) return pageAccessData;
            if (!multiDepthMenuList.includes(pageAccessData.id)) {
                pageAccessData.data[subMenu[0].id] = '--';
                pageAccessData.fields = (subMenu ?? []).map(menu => ({
                    name: menu.id,
                    label: menu.label,
                }));
            } else {
                const grandChildMenu = subMenu[0].subMenuList;
                if (!grandChildMenu) return pageAccessData;
                pageAccessData.data[grandChildMenu[0].id] = '--';
                pageAccessData.fields = grandChildMenu.map(menu => ({
                    name: menu.id,
                    label: `${subMenu[0].label} > ${menu.label}`,
                }));
            }
            return pageAccessData;
        });
        const convertPagePermissionData = () => {
            const pageAccessDataInitialValue = pageAccessState.allMenuList.map(menuState => ({
                ...menuState,
                data: {},
                fields: [],
            })) as PageAccessState[];
            const pageAccessData = initPageAccessData(pageAccessDataInitialValue);
            const transFormedPagePermission = getPagePermissionMap(baseInfoState.data.page_permissions ?? []);
            Object.keys(transFormedPagePermission).forEach((pagePermission) => {
                const selectedPageAccessData = pageAccessData.find(gnb => gnb.id === pagePermission.split('.')[0]);
                if (selectedPageAccessData?.data) selectedPageAccessData.data[pagePermission] = transFormedPagePermission[pagePermission];
            });
            return pageAccessData;
        };

        const getRoleDetailData = async (roleId) => {
            baseInfoState.loading = true;
            pageAccessState.loading = true;
            try {
                baseInfoState.data = await SpaceConnector.client.identity.role.get({
                    role_id: roleId,
                });

                pageAccessState.pagePermissionStates = convertPagePermissionData();
                policyState.items = [];
                await Promise.all((baseInfoState.data.policies ?? []).map(async (policy) => {
                    try {
                        let res;
                        if (policy.policy_type === POLICY_TYPES.MANAGED) {
                            res = await SpaceConnector.client.repository.policy.get({
                                policy_id: policy.policy_id,
                                policy_type: policy.policy_type,
                            });
                        } else {
                            res = await SpaceConnector.client.identity.policy.get({
                                policy_id: policy.policy_id,
                                policy_type: policy.policy_type,
                            });
                        }
                        res.policy_type = policy.policy_type;
                        policyState.items.push(res);
                    } catch (e) {
                        ErrorHandler.handleError(e);
                    }
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                baseInfoState.data = {};
            } finally {
                baseInfoState.loading = false;
                pageAccessState.loading = false;
            }
        };
        const convertPagePermissionLabel = (data) => {
            switch (data) {
            case PAGE_PERMISSION_TYPE.MANAGE:
                return i18n.t('IAM.ROLE.FORM.MANAGE');
            case PAGE_PERMISSION_TYPE.VIEW:
                return i18n.t('IAM.ROLE.FORM.VIEW');
            default:
                return '--';
            }
        };
        watch(() => props.roleId, () => {
            const roleId = props.roleId;
            getRoleDetailData(roleId);
        }, { immediate: true });

        return {
            ...toRefs(baseInfoState),
            pageAccessState,
            policyState,
            iso8601Formatter,
            ROLE_TYPE_BADGE_OPTION,
            PAGE_PERMISSION_TYPE,
            convertPagePermissionLabel,
            policyTypeBadgeColorFormatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.definition-table-header {
    @apply ml-4 mb-3 text-violet-700 font-bold;
}
</style>
