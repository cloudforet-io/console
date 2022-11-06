<template>
    <p-button-modal
        class="escalation-policy-change-modal"
        :header-title="$t('PROJECT.DETAIL.ALERT.CHANGE_ESCALATION_POLICY_MODAL_TITLE')"
        fade
        :visible.sync="proxyVisible"
        :disabled="!isModalValid"
        @confirm="handleClickConfirm"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <p-box-tab v-model="activeTab"
                           :tabs="tabs"
                >
                    <template #select>
                        <escalation-policy-data-table
                            v-if="activeTab === FORM_MODE.select"
                            :loading="tableState.loading"
                            :items="tableState.items"
                            :select-index.sync="tableState.selectIndex"
                            :table-custom-style="{ maxHeight: '35.25rem', height: 'calc(100vh - 22.5rem)' }"
                            @change="handleChangeDataTable"
                        />
                    </template>
                    <template #create>
                        <escalation-policy-form
                            v-if="activeTab === FORM_MODE.create"
                            :mode="activeTab"
                            :show-scope="false"
                            :show-validation="formState.showValidation"
                            :is-all-valid.sync="formState.isAllValid"
                            :project-id="projectId"
                            @change="handleChangeInputModel"
                        />
                    </template>
                </p-box-tab>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PBoxTab,
} from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import EscalationPolicyDataTable from '@/services/alert-manager/escalation-policy/modules/EscalationPolicyDataTable.vue';
import EscalationPolicyForm from '@/services/alert-manager/escalation-policy/modules/EscalationPolicyForm.vue';
import type { EscalationPolicyFormModel } from '@/services/alert-manager/type';

enum FORM_MODE {
    select = 'select',
    create = 'create',
}

export default {
    name: 'ProjectEscalationPolicyChangeModal',
    components: {
        EscalationPolicyForm,
        EscalationPolicyDataTable,
        PButtonModal,
        PBoxTab,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
        visible: {
            type: Boolean,
            required: true,
        },
        escalationPolicyId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const tableState = reactive({
            loading: true,
            items: [] as any,
            selectIndex: [] as number[],
        });
        const formState = reactive({
            inputModel: {} as EscalationPolicyFormModel,
            showValidation: false,
            isAllValid: false,
        });
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            proxyVisible: useProxyValue('visible', props, emit),
            tabs: computed(() => ([
                {
                    name: FORM_MODE.select,
                    label: i18n.t('PROJECT.DETAIL.ALERT.SELECT_POLICY'),
                },
                {
                    name: FORM_MODE.create,
                    label: i18n.t('PROJECT.DETAIL.ALERT.CREATE_NEW_POLICY'),
                },
            ])),
            activeTab: FORM_MODE.select,
            selectedEscalationPolicyId: undefined,
            isModalValid: computed(() => {
                if (state.activeTab === FORM_MODE.select) return tableState.selectIndex.length;
                return formState.isAllValid;
            }),
        });

        /* Util */
        const setSelectIndex = () => {
            let selectedIndex;
            // eslint-disable-next-line consistent-return
            tableState.items.forEach((item, idx) => {
                if (item.escalation_policy_id === props.escalationPolicyId) {
                    selectedIndex = idx;
                    return false;
                }
            });
            tableState.selectIndex = [selectedIndex];
        };

        /* Api */
        const escalationPolicyApiQueryHelper = new ApiQueryHelper()
            .setSort('created_at', true)
            .setFilters([{ k: 'project_id', v: [props.projectId, null], o: '=' }]);
        let escalationPolicyApiQuery = escalationPolicyApiQueryHelper.data;
        const listEscalationPolicies = async () => {
            try {
                tableState.loading = true;
                const { results } = await SpaceConnector.client.monitoring.escalationPolicy.list({
                    query: escalationPolicyApiQuery,
                });
                tableState.items = results.map((d) => ({
                    ...d,
                    name: {
                        label: d.name,
                        isDefault: d.is_default,
                    },
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                }));
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
                const { escalation_policy_id } = await SpaceConnector.client.monitoring.escalationPolicy.create({
                    ...formState.inputModel,
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
                await SpaceConnector.client.monitoring.projectAlertConfig.update({
                    project_id: props.projectId,
                    escalation_policy_id: escalationPolicyId,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_ESCALATION_POLICY'));
            }
        };

        /* Event */
        const handleClickConfirm = async () => {
            let newEscalationPolicyId;
            if (state.activeTab === FORM_MODE.create) {
                formState.showValidation = true;
                if (!formState.isAllValid) return;
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
        const handleChangeInputModel = (inputModel) => {
            formState.inputModel = inputModel;
        };
        const handleChangeDataTable = async (options: any = {}) => {
            escalationPolicyApiQuery = getApiQueryWithToolboxOptions(escalationPolicyApiQueryHelper, options) ?? escalationPolicyApiQuery;
            await listEscalationPolicies();
        };

        /* Watcher */
        watch(() => props.visible, (visible) => {
            if (visible) listEscalationPolicies();
        });

        return {
            ...toRefs(state),
            tableState,
            formState,
            FORM_MODE,
            handleClickConfirm,
            handleChangeInputModel,
            handleChangeDataTable,
        };
    },
};
</script>

<style lang="postcss" scoped>
/* custom design-system component - p-button-modal */
.escalation-policy-change-modal {
    :deep(.modal-content) {
        height: 53.75rem;
    }
    :deep(.modal-content-wrapper) {
        padding: 1rem 0;
    }
}
</style>
