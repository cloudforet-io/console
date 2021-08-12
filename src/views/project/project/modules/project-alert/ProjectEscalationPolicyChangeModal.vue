<template>
    <p-button-modal
        class="escalation-policy-change-modal"
        :header-title="$t('PROJECT.DETAIL.ALERT.CHANGE_ESCALATION_POLICY_MODAL_TITLE')"
        fade
        :visible.sync="proxyVisible"
        :disabled="!isModalValid"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <p-box-tab v-model="activeTab" :tabs="tabs">
                    <template #select>
                        <escalation-policy-data-table
                            v-if="activeTab === FORM_MODE.select"
                            :loading="tableState.loading"
                            :items="tableState.items"
                            :select-index.sync="tableState.selectIndex"
                            @change="onChangeDataTable"
                        />
                    </template>
                    <template #create>
                        <escalation-policy-form
                            v-if="activeTab === FORM_MODE.create"
                            :mode="activeTab"
                            :show-scope="false"
                            :show-validation="formState.showValidation"
                            :is-all-valid.sync="formState.isAllValid"
                            @change="onChangeInputModel"
                        />
                    </template>
                </p-box-tab>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PBoxTab,
} from '@spaceone/design-system';

import EscalationPolicyDataTable from '@/views/monitoring/alert-manager/modules/EscalationPolicyDataTable.vue';
import EscalationPolicyForm from '@/views/monitoring/alert-manager/modules/EscalationPolicyForm.vue';

import { makeProxy, iso8601Formatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { EscalationPolicyFormModel } from '@/views/monitoring/alert-manager/type';
import { store } from '@/store';


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
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
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
            proxyVisible: makeProxy<boolean>('visible', props, emit),
            tabs: computed(() => ([
                {
                    name: FORM_MODE.select,
                    label: vm.$t('PROJECT.DETAIL.ALERT.SELECT_POLICY'),
                },
                {
                    name: FORM_MODE.create,
                    label: vm.$t('PROJECT.DETAIL.ALERT.CREATE_NEW_POLICY'),
                },
            ])),
            activeTab: FORM_MODE.select,
            changedEscalationPolicyId: undefined,
            isModalValid: computed(() => {
                if (state.activeTab === FORM_MODE.select) return tableState.selectIndex.length;
                return formState.isAllValid;
            }),
        });

        /* util */
        const setSelectIndex = () => {
            // eslint-disable-next-line consistent-return
            tableState.items.forEach((item, idx) => {
                if (item.escalation_policy_id === props.escalationPolicyId) {
                    tableState.selectIndex.push(idx);
                    return false;
                }
            });
        };

        /* api */
        const escalationPolicyApiQueryHelper = new ApiQueryHelper()
            .setSort('created_at', true)
            .setFilters([{ k: 'project_id', v: [props.projectId, null], o: '=' }]);
        let escalationPolicyApiQuery = escalationPolicyApiQueryHelper.data;
        const listEscalationPolicies = async () => {
            try {
                tableState.loading = true;
                const res = await SpaceConnector.client.monitoring.escalationPolicy.list({
                    query: escalationPolicyApiQuery,
                });
                tableState.items = res.results.map(d => ({
                    ...d,
                    name: {
                        label: d.name,
                        isDefault: d.is_default,
                    },
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                }));
                setSelectIndex();
            } catch (e) {
                tableState.items = [];
                console.error(e);
            } finally {
                tableState.loading = false;
            }
        };
        const createEscalationPolicy = async () => {
            try {
                const res = await SpaceConnector.client.monitoring.escalationPolicy.create({
                    ...formState.inputModel,
                    project_id: props.projectId,
                });
                state.changedEscalationPolicyId = res.escalation_policy_id;
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_ESCALATION_POLICY'), e, root);
            }
        };
        const updateEscalationPolicy = async () => {
            try {
                await SpaceConnector.client.monitoring.projectAlertConfig.update({
                    project_id: props.projectId,
                    escalation_policy_id: state.changedEscalationPolicyId,
                });
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onClickConfirm = async () => {
            if (state.activeTab === FORM_MODE.create) {
                formState.showValidation = true;
                if (!formState.isAllValid) return;
                await createEscalationPolicy();
            } else {
                state.changedEscalationPolicyId = tableState.items[tableState.selectIndex[0]].escalation_policy_id;
            }

            try {
                await updateEscalationPolicy();
                emit('confirm');
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALERT.ALT_S_CHANGE_ESCALATION_POLICY'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALERT.ALT_E_CHANGE_ESCALATION_POLICY'), e, root);
            } finally {
                state.proxyVisible = false;
            }
        };
        const onChangeInputModel = (inputModel) => {
            formState.inputModel = inputModel;
        };
        const onChangeDataTable = async (options: any = {}) => {
            escalationPolicyApiQuery = getApiQueryWithToolboxOptions(escalationPolicyApiQueryHelper, options) ?? escalationPolicyApiQuery;
            await listEscalationPolicies();
        };

        watch([() => props.projectId, () => props.escalationPolicyId], ([projectId, escalationPolicyId]) => {
            if (projectId && escalationPolicyId) listEscalationPolicies();
        }, { immediate: true });

        return {
            ...toRefs(state),
            tableState,
            formState,
            FORM_MODE,
            onClickConfirm,
            onChangeInputModel,
            onChangeDataTable,
        };
    },
};
</script>

<style lang="postcss" scoped>
.escalation-policy-change-modal::v-deep {
    .modal-content {
        height: 53.75rem;
    }

    .modal-content-wrapper {
        padding: 1rem 0;
    }
}
</style>
