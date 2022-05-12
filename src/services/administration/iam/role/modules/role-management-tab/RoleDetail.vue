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
        <div v-for="gnbState in gnbStateList" :key="gnbState.id">
            <h4 class="definition-table-header">
                {{ gnbState.title }}
            </h4>
            <p-definition-table :fields="gnbState.fields" :data="gnbState.data" :loading="pageAccessState.loading"
                                :skeleton-rows="3" disable-copy v-on="$listeners"
            >
                <template #data="{ data }">
                    {{ convertPagePermissionLabel(data) }}
                </template>
            </p-definition-table>
        </div>
        <!--song-lang-->
        <p-panel-top>API Policy Attachment</p-panel-top>
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
import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import { RoleData } from '@/services/administration/iam/role/type';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
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

type DataTableTranslationField = DataTableField | {
    label?: TranslateResult | string;
}

type PageAccessState = Record<string, PagePermissionType | '--'>;

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
            // song-lang
            title: computed(() => i18n.t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION')),
            loading: true,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            fields: computed<DataTableTranslationField[]>(() => [ // song-lang
                { name: 'name', label: i18n.t('IDENTITY.USER.MAIN.NAME') },
                { name: 'tag.description', label: 'Description' },
                { name: 'role_type', label: 'Role Type', disableCopy: true },
                { name: 'created_at', label: i18n.t('IDENTITY.USER.MAIN.CREATED_AT') },
            ]),
            data: {} as Partial<RoleData>,
        });

        const pageAccessState = reactive({
            // song-lang
            title: 'Page Access',
            loading: false,
        });
        const assetInventoryState = reactive({
            id: MENU_ID.ASSET_INVENTORY,
            title: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY].label,
            fields: computed(() => [
                { name: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, label: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE].label },
                { name: MENU_ID.ASSET_INVENTORY_COLLECTOR, label: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_COLLECTOR].label },
                { name: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT, label: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT].label },
            ]),
            data: {} as PageAccessState,
        });
        const costExplorerState = reactive({
            id: MENU_ID.COST_EXPLORER,
            title: MENU_INFO_MAP[MENU_ID.COST_EXPLORER].label,
            fields: computed(() => [
                { name: MENU_ID.COST_EXPLORER_DASHBOARD, label: MENU_INFO_MAP[MENU_ID.COST_EXPLORER_DASHBOARD].label },
                { name: MENU_ID.COST_EXPLORER_COST_ANALYSIS, label: MENU_INFO_MAP[MENU_ID.COST_EXPLORER_COST_ANALYSIS].label },
                { name: MENU_ID.COST_EXPLORER_BUDGET, label: MENU_INFO_MAP[MENU_ID.COST_EXPLORER_BUDGET].label },
            ]),
            data: {} as PageAccessState,
        });
        const alertManagerState = reactive({
            id: MENU_ID.ALERT_MANAGER,
            title: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].label,
            fields: computed(() => [
                { name: MENU_ID.ALERT_MANAGER_DASHBOARD, label: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_DASHBOARD].label },
                { name: MENU_ID.ALERT_MANAGER_ALERT, label: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_ALERT].label },
                { name: MENU_ID.ALERT_MANAGER_ESCALATION_POLICY, label: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_ESCALATION_POLICY].label },
            ]),
            data: {} as PageAccessState,
        });
        const administrationState = reactive({
            id: MENU_ID.ADMINISTRATION,
            title: MENU_INFO_MAP[MENU_ID.ADMINISTRATION].label,
            fields: computed(() => [
                { name: MENU_ID.ADMINISTRATION_USER, label: `${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_IAM].label} > ${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_USER].label}` },
                { name: MENU_ID.ADMINISTRATION_ROLE, label: `${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_IAM].label} > ${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_ROLE].label}` },
                { name: MENU_ID.ADMINISTRATION_POLICY, label: `${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_IAM].label} > ${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_POLICY].label}` },
            ]),
            data: {} as PageAccessState,
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

        const initStateData = () => {
            assetInventoryState.data = { [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: '--' };
            costExplorerState.data = { [MENU_ID.COST_EXPLORER_DASHBOARD]: '--' };
            alertManagerState.data = { [MENU_ID.ALERT_MANAGER_DASHBOARD]: '--' };
            administrationState.data = { [MENU_ID.ADMINISTRATION_USER]: '--' };
        };
        const convertPagePermissionData = () => {
            const pagePermissionData = getPagePermissionMap(baseInfoState.data.page_permissions ?? []);
            initStateData();
            Object.keys(pagePermissionData).forEach((pagePermission) => {
                switch (pagePermission.split('.')[0]) {
                case MENU_ID.ASSET_INVENTORY:
                    assetInventoryState.data[pagePermission] = pagePermissionData[pagePermission];
                    break;
                case MENU_ID.COST_EXPLORER:
                    costExplorerState.data[pagePermission] = pagePermissionData[pagePermission];
                    break;
                case MENU_ID.ALERT_MANAGER:
                    alertManagerState.data[pagePermission] = pagePermissionData[pagePermission];
                    break;
                case MENU_ID.ADMINISTRATION:
                    administrationState.data[pagePermission] = pagePermissionData[pagePermission];
                    break;
                default:
                    break;
                }
            });
        };

        const getRoleDetailData = async (roleId) => {
            baseInfoState.loading = true;
            pageAccessState.loading = true;
            try {
                baseInfoState.data = await SpaceConnector.client.identity.role.get({
                    role_id: roleId,
                });
                convertPagePermissionData();
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
                return i18n.t('Manage'); // song-lang
            case PAGE_PERMISSION_TYPE.VIEW:
                return i18n.t('View'); // song-lang
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
            gnbStateList: [assetInventoryState, costExplorerState, alertManagerState, administrationState],
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
