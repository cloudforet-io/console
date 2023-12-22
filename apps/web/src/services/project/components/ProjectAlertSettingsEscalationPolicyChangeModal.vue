<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PBoxTab,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import type { EscalationPolicyCreateParameters } from '@/schema/monitoring/escalation-policy/api-verbs/create';
import type {
    EscalationPolicyListParameters,
    EscalationPolicyListResponse,
} from '@/schema/monitoring/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { ProjectAlertConfigUpdateParameters } from '@/schema/monitoring/project-alert-config/api-verbs/update';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import EscalationPolicyDataTable from '@/services/alert-manager/components/EscalationPolicyDataTable.vue';
import EscalationPolicyForm from '@/services/alert-manager/components/EscalationPolicyForm.vue';
import { ACTION } from '@/services/alert-manager/constants/alert-constant';
import { useEscalationPolicyFormStore } from '@/services/alert-manager/stores/escalation-policy-form-store';

interface TableItem extends Omit<EscalationPolicyModel, 'name'> {
    name: {
        label: string;
        isDefault: boolean;
    };
    created_at: string;
}

interface Props {
    projectId?: string;
    visible: boolean;
    escalationPolicyId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: undefined,
    visible: false,
    escalationPolicyId: undefined,
});
const emit = defineEmits<{(e: 'confirm'): void}>();

const FORM_MODE = {
    SELECT: 'SELECT',
    CREATE: 'CREATE',
} as const;
type FormMode = typeof FORM_MODE[keyof typeof FORM_MODE];

const escalationPolicyFormStore = useEscalationPolicyFormStore();
const escalationPolicyFormState = escalationPolicyFormStore.$state;
const tableState = reactive({
    loading: true,
    items: [] as TableItem[],
    selectIndex: [] as number[],
});
const state = reactive({
    timezone: computed<string>(() => store.state.user.timezone),
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    tabs: computed<TabItem[]>(() => ([
        {
            name: FORM_MODE.SELECT,
            label: i18n.t('PROJECT.DETAIL.ALERT.SELECT_POLICY'),
        },
        {
            name: FORM_MODE.CREATE,
            label: i18n.t('PROJECT.DETAIL.ALERT.CREATE_NEW_POLICY'),
        },
    ])),
    activeTab: FORM_MODE.SELECT as FormMode,
    selectedEscalationPolicyId: undefined as string|undefined,
    isModalValid: computed<boolean>(() => {
        if (state.activeTab === FORM_MODE.SELECT) return tableState.selectIndex.length;
        return escalationPolicyFormStore.isAllValid;
    }),
});

/* Util */
const setSelectIndex = () => {
    let selectedIndex: number|undefined;
    tableState.items.some((item, idx) => {
        if (item.escalation_policy_id === props.escalationPolicyId) {
            selectedIndex = idx;
            return true;
        }
        return false;
    });
    if (selectedIndex !== undefined) tableState.selectIndex = [selectedIndex];
};

/* Api */
const escalationPolicyApiQueryHelper = new ApiQueryHelper()
    .setSort('created_at', true)
    .setFilters([{ k: 'project_id', v: [props.projectId, null], o: '=' }]);
let escalationPolicyApiQuery = escalationPolicyApiQueryHelper.dataV2;
const listEscalationPolicies = async () => {
    try {
        tableState.loading = true;
        const { results } = await SpaceConnector.clientV2.monitoring.escalationPolicy.list<EscalationPolicyListParameters, EscalationPolicyListResponse>({
            query: escalationPolicyApiQuery,
        });
        tableState.items = results?.map((d) => ({
            ...d,
            name: {
                label: d.name,
                isDefault: d.is_default,
            },
            created_at: iso8601Formatter(d.created_at, state.timezone),
        })) ?? [];
        setSelectIndex();
    } catch (e) {
        ErrorHandler.handleError(e);
        tableState.items = [];
    } finally {
        tableState.loading = false;
    }
};
const createEscalationPolicy = async (): Promise<string | undefined> => {
    try {
        if (!escalationPolicyFormState.name) throw new Error('name is required');
        const { escalation_policy_id } = await SpaceConnector.clientV2.monitoring.escalationPolicy.create<EscalationPolicyCreateParameters, EscalationPolicyModel>({
            name: escalationPolicyFormState.name,
            rules: escalationPolicyFormState.rules,
            resource_group: escalationPolicyFormState.resourceGroup,
            finish_condition: escalationPolicyFormState.finishCondition,
            repeat_count: escalationPolicyFormState.repeatCount,
            project_id: props.projectId,
        });
        return escalation_policy_id;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_ESCALATION_POLICY'));
        return undefined;
    }
};
const updateProjectAlertConfig = async (escalationPolicyId: string) => {
    try {
        await SpaceConnector.clientV2.monitoring.projectAlertConfig.update<ProjectAlertConfigUpdateParameters, ProjectAlertConfigModel>({
            project_id: props.projectId,
            escalation_policy_id: escalationPolicyId,
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_ESCALATION_POLICY'));
    }
};

/* Event */
const handleClickConfirm = async () => {
    let newEscalationPolicyId: string|undefined;
    if (state.activeTab === FORM_MODE.CREATE) {
        if (!escalationPolicyFormStore.isAllValid) return;
        newEscalationPolicyId = await createEscalationPolicy();
    } else {
        newEscalationPolicyId = tableState.items[tableState.selectIndex[0]].escalation_policy_id;
    }
    if (newEscalationPolicyId) {
        await updateProjectAlertConfig(newEscalationPolicyId);
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_ESCALATION_POLICY'), '');
    }
    emit('confirm');
    state.proxyVisible = false;
};
const handleChangeDataTable = async (options: any = {}) => {
    escalationPolicyApiQuery = getApiQueryWithToolboxOptions(escalationPolicyApiQueryHelper, options) ?? escalationPolicyApiQuery;
    await listEscalationPolicies();
};

/* Watcher */
watch(() => props.visible, (visible) => {
    if (visible) listEscalationPolicies();
});
</script>

<template>
    <p-button-modal
        class="project-alert-settings-escalation-policy-change-modal"
        :header-title="$t('PROJECT.DETAIL.ALERT.CHANGE_ESCALATION_POLICY_MODAL_TITLE')"
        fade
        :visible.sync="state.proxyVisible"
        :disabled="!state.isModalValid"
        @confirm="handleClickConfirm"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <p-box-tab v-model="state.activeTab"
                           :tabs="state.tabs"
                >
                    <template #select>
                        <escalation-policy-data-table
                            v-if="state.activeTab === FORM_MODE.SELECT"
                            :loading="tableState.loading"
                            :items="tableState.items"
                            :select-index.sync="tableState.selectIndex"
                            :table-custom-style="{ maxHeight: '35.25rem', height: 'calc(100vh - 22.5rem)' }"
                            @change="handleChangeDataTable"
                        />
                    </template>
                    <template #create>
                        <escalation-policy-form v-if="state.activeTab === FORM_MODE.CREATE"
                                                :show-scope="false"
                                                :mode="ACTION.create"
                        />
                    </template>
                </p-box-tab>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-button-modal */
.project-alert-settings-escalation-policy-change-modal {
    :deep(.modal-content) {
        height: 53.75rem;
    }
    :deep(.modal-content-wrapper) {
        padding: 1rem 0;
    }
}
</style>
