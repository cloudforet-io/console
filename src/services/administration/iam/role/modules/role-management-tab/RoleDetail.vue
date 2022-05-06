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
            <p-definition-table :fields="gnbState.fields" :data="pageAccessState.data" :loading="pageAccessState.loading"
                                :skeleton-rows="3" v-on="$listeners"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PPanelTop, PDefinitionTable, PBadge } from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import { i18n } from '@/translations';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';
import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import { RoleData } from '@/services/administration/iam/role/type';
import { MENU_ID, MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

interface DefinitionTableState {
    id: MenuId;
    title: string;
    fields: { name: MenuId; label: string }[];
    data: any;
}

export default {
    name: 'UserDetail',
    components: {
        PDefinitionTable,
        PPanelTop,
        PBadge,
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
            fields: computed(() => [ // song-lang
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
        const assetInventoryState: DefinitionTableState = reactive({
            id: MENU_ID.ASSET_INVENTORY,
            title: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY].label,
            fields: computed(() => [
                { name: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, label: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE].label },
                { name: MENU_ID.ASSET_INVENTORY_COLLECTOR, label: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_COLLECTOR].label },
                { name: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT, label: MENU_INFO_MAP[MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT].label },
            ]),
            data: {} as any,
        });
        const costExplorerState: DefinitionTableState = reactive({
            id: MENU_ID.COST_EXPLORER,
            title: MENU_INFO_MAP[MENU_ID.COST_EXPLORER].label,
            fields: computed(() => [
                { name: MENU_ID.COST_EXPLORER_DASHBOARD, label: MENU_INFO_MAP[MENU_ID.COST_EXPLORER_DASHBOARD].label },
                { name: MENU_ID.COST_EXPLORER_COST_ANALYSIS, label: MENU_INFO_MAP[MENU_ID.COST_EXPLORER_COST_ANALYSIS].label },
                { name: MENU_ID.COST_EXPLORER_BUDGET, label: MENU_INFO_MAP[MENU_ID.COST_EXPLORER_BUDGET].label },
            ]),
            data: {} as any,
        });
        const alertManagerState: DefinitionTableState = reactive({
            id: MENU_ID.ALERT_MANAGER,
            title: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER].label,
            fields: computed(() => [
                { name: MENU_ID.ALERT_MANAGER_DASHBOARD, label: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_DASHBOARD].label },
                { name: MENU_ID.ALERT_MANAGER_ALERT, label: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_ALERT].label },
                { name: MENU_ID.ALERT_MANAGER_ESCALATION_POLICY, label: MENU_INFO_MAP[MENU_ID.ALERT_MANAGER_ESCALATION_POLICY].label },
            ]),
            data: {} as any,
        });
        const administrationState: DefinitionTableState = reactive({
            id: MENU_ID.ADMINISTRATION,
            title: MENU_INFO_MAP[MENU_ID.ADMINISTRATION].label,
            fields: computed(() => [
                { name: MENU_ID.ADMINISTRATION_USER, label: `${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_IAM].label} > ${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_USER].label}` },
                { name: MENU_ID.ADMINISTRATION_ROLE, label: `${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_IAM].label} > ${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_ROLE].label}` },
                { name: MENU_ID.ADMINISTRATION_POLICY, label: `${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_IAM].label} > ${MENU_INFO_MAP[MENU_ID.ADMINISTRATION_POLICY].label}` },
            ]),
            data: {} as any,
        });
        const getRoleDetailData = async (roleId) => {
            baseInfoState.loading = true;
            try {
                const res = await SpaceConnector.client.identity.role.get({
                    role_id: roleId,
                });
                baseInfoState.data = res;
            } catch (e) {
                ErrorHandler.handleError(e);
                baseInfoState.data = {};
            } finally {
                baseInfoState.loading = false;
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
            iso8601Formatter,
            ROLE_TYPE_BADGE_OPTION,
        };
    },
};
</script>
<style lang="postcss" scoped>
.definition-table-header {
    @apply ml-4 mb-3 text-violet-700 font-bold;
}
</style>
