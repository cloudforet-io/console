<template>
    <p-button-modal
        class="escalation-policy-update-modal"
        :header-title="$t('PROJECT.DETAIL.ALERT.SET_ESCALATION_POLICY_MODAL_TITLE')"
        fade
        :visible.sync="proxyVisible"
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
        <template #confirm-button>
            {{ $t('PROJECT.DETAIL.ALERT.CHANGE') }}
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

import EscalationPolicyDataTable from '@/views/monitoring/alert/modules/EscalationPolicyDataTable.vue';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { iso8601Formatter, showErrorMessage, showSuccessMessage } from '@/lib/util';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { getApiQueryWithToolboxOptions } from '@/lib/component-utils/toolbox';
import { store } from '@/store';
import EscalationPolicyForm from '@/views/monitoring/alert/modules/EscalationPolicyForm.vue';
import { EscalationPolicyFormModel } from '@/views/monitoring/alert/type';


enum FORM_MODE {
    select = 'select',
    create = 'create',
}

export default {
    name: 'ProjectEscalationPolicyUpdateModal',
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
        });
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
        const escalationPolicyApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
        let escalationPolicyApiQuery = escalationPolicyApiQueryHelper.data;
        const listEscalationPolicies = async () => {
            try {
                tableState.loading = true;
                const res = await SpaceConnector.client.monitoring.escalationPolicy.list({
                    project_id: props.projectId,
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
                emit('refresh');
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
.escalation-policy-update-modal::v-deep {
    .modal-content {
        height: 53.75rem;
    }

    .modal-content-wrapper {
        padding: 1rem 0;
    }
}
</style>
