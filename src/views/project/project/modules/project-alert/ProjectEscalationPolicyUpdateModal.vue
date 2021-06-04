<template>
    <p-button-modal
        class="escalation-policy-update-modal"
        :header-title="$t('PROJECT.DETAIL.ALERT.UPDATE_ESCALATION_POLICY_MODAL_TITLE')"
        fade
        :visible.sync="proxyVisible"
        @confirm="onClickConfirm"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <button v-for="formMode in formModes"
                        :class="{'bg-red': selectedFormMode === formMode.name}"
                        @click="() => selectedFormMode = formMode.name"
                >
                    {{ formMode.label }}
                </button>
                <escalation-policy-data-table
                    v-if="selectedFormMode === FORM_MODE.select"
                    :loading="tableState.loading"
                    :items="tableState.items"
                    :select-index.sync="tableState.selectIndex"
                    :sort-by.sync="tableState.sortBy"
                    :sort-desc.sync="tableState.sortDesc"
                />
                <escalation-policy-form
                    v-if="selectedFormMode === FORM_MODE.create"
                    :mode="selectedFormMode"
                    :show-scope="false"
                    :show-validation="formState.showValidation"
                    :is-all-valid.sync="formState.isAllValid"
                    @change="onChangeInputModel"
                />
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
    PButtonModal,
} from '@spaceone/design-system';

import EscalationPolicyDataTable from '@/views/monitoring/alert/modules/EscalationPolicyDataTable.vue';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { iso8601Formatter, showErrorMessage, showSuccessMessage } from '@/lib/util';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
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
            selectedFormMode: FORM_MODE.select,
            formModes: computed(() => ([
                {
                    name: FORM_MODE.select,
                    label: vm.$t('PROJECT.DETAIL.ALERT.SELECT_POLICY'),
                },
                {
                    name: FORM_MODE.create,
                    label: vm.$t('PROJECT.DETAIL.ALERT.CREATE_NEW_POLICY'),
                },
            ])),
            changedEscalationPolicyId: undefined,
        });
        const tableState = reactive({
            loading: true,
            items: [] as any,
            selectIndex: [] as number[],
            sortBy: '',
            sortDesc: true,
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
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(tableState.sortBy, tableState.sortDesc);
            return apiQuery.data;
        };
        const listEscalationPolicies = async () => {
            try {
                tableState.loading = true;
                const res = await SpaceConnector.client.monitoring.escalationPolicy.list({
                    project_id: props.projectId,
                    query: getQuery(),
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
            if (state.selectedFormMode === FORM_MODE.create) {
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
