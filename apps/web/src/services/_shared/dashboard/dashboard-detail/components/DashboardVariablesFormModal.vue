<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, isEmpty } from 'lodash';

import {
    PButtonModal, PFieldGroup, PTextInput, PRadioGroup, PRadio, PScopedNotification,
} from '@cloudforet/mirinae';

import type { DashboardGlobalVariable, ManualVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { DashboardGlobalVariableSchemaProperties } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardVariablesFormDynamic
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardVariablesFormDynamic.vue';
import DashboardVariablesFormManual
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardVariablesFormManual.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';

type ManualVariableData = Omit<ManualVariable, 'management'|'key'|'name'|'method'>;
type DynamicVariableData = Omit<DashboardGlobalVariable, 'management'|'key'|'name'|'method'>;
const METHOD_TYPE = {
    MANUAL_ENTRY: 'manual',
    DYNAMIC_LIST_FROM_SOURCE: 'dynamic',
} as const;
type MethodType = typeof METHOD_TYPE[keyof typeof METHOD_TYPE];
interface Props {
    visible: boolean;
    modalType: 'CREATE'|'UPDATE';
    variableKey?: string;
    dashboardId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    variableKey: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();
const dashboardId = computed(() => props.dashboardId);

const userStore = useUserStore();

/* Query */
const {
    dashboard,
    fetcher,
    keys,
} = useDashboardGetQuery({
    dashboardId,
});
const queryClient = useQueryClient();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    modalTitle: computed(() => {
        if (props.modalType === 'CREATE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.CREATE_VARIABLE');
        return i18n.t('DASHBOARDS.DETAIL.VARIABLES.EDIT_VARIABLE');
    }),
    isAllValid: computed<boolean>(() => {
        if (!isAllValid.value) return false;
        if (state.selectedMethod === METHOD_TYPE.MANUAL_ENTRY) return state.isManualFormValid;
        return state.isDynamicFormValid;
    }),
    dashboardVarsSchemaProperties: computed<DashboardGlobalVariableSchemaProperties>(() => dashboard.value?.vars_schema?.properties || {}),
    targetVariable: computed<DashboardGlobalVariable|undefined>(() => {
        if (props.modalType === 'CREATE' || !props.variableKey || !props.visible) return undefined;
        return cloneDeep(state.dashboardVarsSchemaProperties[props.variableKey]);
    }),
    existingVariableNameList: computed<string[]>(() => {
        const _nameList: string[] = Object.values(state.dashboardVarsSchemaProperties).map((d) => d.name);
        if (props.modalType === 'CREATE' || !state.targetVariable) return _nameList;
        return _nameList.filter((d) => d !== state.targetVariable?.name);
    }),
    existingVariableKeyList: computed<string[]>(() => {
        const _keyList: string[] = Object.values(state.dashboardVarsSchemaProperties).map((d) => d.key);
        if (props.modalType === 'CREATE' || !state.targetVariable) return _keyList;
        return _keyList.filter((d) => d !== state.targetVariable?.key);
    }),
    selectedMethod: METHOD_TYPE.MANUAL_ENTRY as MethodType,
    isManualFormValid: false,
    isDynamicFormValid: false,
    showUpdateWarning: computed<boolean>(() => {
        if (props.modalType === 'CREATE') return false;
        const _varsKeys = Object.keys(dashboard.value?.vars || {});
        return _varsKeys.includes(props.variableKey || '');
    }),
    //
    manualGlobalVariable: {} as ManualVariableData,
    dynamicGlobalVariable: {} as DynamicVariableData,
    dashboardGlobalVariable: computed<DashboardGlobalVariable>(() => {
        if (state.selectedMethod === METHOD_TYPE.MANUAL_ENTRY) {
            return {
                management: 'custom',
                key: variableKey.value || '',
                name: variableName.value || '',
                method: 'manual',
                ...state.manualGlobalVariable,
            };
        }
        return {
            management: 'custom',
            key: variableKey.value || '',
            name: variableName.value || '',
            method: 'dynamic',
            ...state.dynamicGlobalVariable,
        };
    }),
    variableFormSuccessMessage: computed(() => {
        if (props.modalType === 'CREATE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_CREATE_DASHBOARD_VARS_SCHEMA');
        return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_UPDATE_DASHBOARD_VARS_SCHEMA');
    }),
    variableFormFailMessage: computed(() => {
        if (props.modalType === 'CREATE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_CREATE_DASHBOARD_VARS_SCHEMA');
        return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_UPDATE_DASHBOARD_VARS_SCHEMA');
    }),
});
const {
    forms: { variableName, variableKey },
    setForm,
    initForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    variableName: undefined as string|undefined,
    variableKey: undefined as string|undefined,
}, {
    variableName(value: string) {
        if (loading.value) return '';
        if (!value) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.NAME_REQUIRED');
        if (state.existingVariableNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.NAME_DUPLICATED');
        return '';
    },
    variableKey(value: string) {
        if (loading.value) return '';
        if (!value) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.KEY_REQUIRED');
        if (state.existingVariableKeyList.find((d) => d === value)) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.KEY_DUPLICATED');
        const _snakeCaseRegex = RegExp(/^[a-z]+(_[a-z]+)*$/);
        if (!_snakeCaseRegex.test(value)) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.KEY_INVALID');
        return '';
    },
});

/* Util */
const initSelectedVariable = (variable: DashboardGlobalVariable) => {
    setForm('variableName', variable.name);
    setForm('variableKey', variable.key);
    if (variable.method === METHOD_TYPE.MANUAL_ENTRY) {
        state.selectedMethod = METHOD_TYPE.MANUAL_ENTRY;
        state.manualGlobalVariable = variable;
    } else {
        state.selectedMethod = METHOD_TYPE.DYNAMIC_LIST_FROM_SOURCE;
        state.dynamicGlobalVariable = variable;
    }
};
const resetState = () => {
    initForm();
    state.selectedMethod = METHOD_TYPE.MANUAL_ENTRY;
    state.manualGlobalVariable = {};
    state.dynamicGlobalVariable = {};
    state.isManualFormValid = false;
    state.isDynamicFormValid = false;
};

/* Api */
const createDashboardVarsSchema = (_dashboardId: string) => {
    mutate({
        dashboard_id: _dashboardId,
        vars_schema: {
            properties: {
                ...state.dashboardVarsSchemaProperties,
                [state.dashboardGlobalVariable.key]: {
                    ...state.dashboardGlobalVariable,
                    use: true,
                    created_by: userStore.state.userId,
                },
            },
        },
    });
};
const updateDashboardVarsSchema = (_dashboardId: string) => {
    const _originalKey = state.targetVariable?.key;
    if (!_originalKey) return;
    const _newVarsSchemaProperties = cloneDeep(state.dashboardVarsSchemaProperties);
    delete _newVarsSchemaProperties[_originalKey];
    _newVarsSchemaProperties[state.dashboardGlobalVariable.key] = {
        ...state.dashboardGlobalVariable,
        use: state.targetVariable?.use || false,
        created_by: state.targetVariable?.created_by,
    };
    const _vars = cloneDeep(dashboard.value?.vars || {});
    delete _vars[_originalKey];
    mutate({
        dashboard_id: _dashboardId,
        vars_schema: {
            properties: _newVarsSchemaProperties,
        },
        vars: _vars,
    });
};

const { mutate, isPending: loading } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (_dashboard: PublicDashboardModel|PrivateDashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            queryClient.setQueryData(dashboardQueryKey.value, (oldDashboard) => {
                if (!oldDashboard) return oldDashboard;
                return {
                    ...oldDashboard,
                    vars_schema: _dashboard.vars_schema,
                    vars: _dashboard.vars,
                };
            });
            showSuccessMessage(state.variableFormSuccessMessage, '');
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, state.variableFormFailMessage);
        },
        onSettled() {
            state.proxyVisible = false;
        },
    },
);

/* Event */
const handleConfirm = async () => {
    if (!dashboardId.value) return;
    if (props.modalType === 'CREATE') {
        createDashboardVarsSchema(dashboardId.value);
    } else {
        updateDashboardVarsSchema(dashboardId.value);
    }
};
const handleClickClose = () => {
    state.proxyVisible = false;
};
const handleChangeMethod = (method: MethodType) => {
    state.selectedMethod = method;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible) {
        if (props.modalType === 'UPDATE' && props.variableKey) {
            const _targetProperty = cloneDeep(state.dashboardVarsSchemaProperties[props.variableKey]);
            if (isEmpty(_targetProperty)) return;
            initSelectedVariable(_targetProperty);
        }
    } else {
        resetState();
    }
});
</script>

<template>
    <p-button-modal :header-title="state.modalTitle"
                    class="notification-email-modal-wrapper"
                    :visible.sync="state.proxyVisible"
                    :loading="loading"
                    :disabled="!state.isAllValid"
                    @confirm="handleConfirm"
                    @cancel="handleClickClose"
                    @close="handleClickClose"
    >
        <template #body>
            <p-scoped-notification v-if="state.showUpdateWarning"
                                   type="warning"
                                   icon="ic_warning-filled"
                                   layout="in-section"
                                   class="mb-4"
            >
                {{ $t('DASHBOARDS.DETAIL.VARIABLES.UPDATE_WARNING') }}
            </p-scoped-notification>
            <div class="grid grid-cols-12 gap-4">
                <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.NAME')"
                               :invalid="invalidState.variableName"
                               :invalid-text="invalidTexts.variableName"
                               required
                               class="col-span-6"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="variableName"
                                      :invalid="invalid"
                                      block
                                      @update:value="setForm('variableName', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.KEY')"
                               :invalid="invalidState.variableKey"
                               :invalid-text="invalidTexts.variableKey"
                               required
                               class="col-span-6"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="variableKey"
                                      :invalid="invalid"
                                      block
                                      @update:value="setForm('variableKey', $event)"
                        />
                    </template>
                </p-field-group>
            </div>
            <!-- Method -->
            <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.METHOD')"
                           required
            >
                <p-radio-group>
                    <p-radio :value="METHOD_TYPE.MANUAL_ENTRY"
                             :selected="state.selectedMethod"
                             @change="handleChangeMethod"
                    >
                        {{ $t('DASHBOARDS.DETAIL.VARIABLES.MANUAL_ENTRY') }}
                    </p-radio>
                    <p-radio :value="METHOD_TYPE.DYNAMIC_LIST_FROM_SOURCE"
                             :selected="state.selectedMethod"
                             @change="handleChangeMethod"
                    >
                        {{ $t('DASHBOARDS.DETAIL.VARIABLES.DYNAMIC_LIST_FROM_SOURCE') }}
                    </p-radio>
                </p-radio-group>
            </p-field-group>
            <dashboard-variables-form-manual v-show="state.selectedMethod === METHOD_TYPE.MANUAL_ENTRY"
                                             :is-valid.sync="state.isManualFormValid"
                                             :data.sync="state.manualGlobalVariable"
                                             :original-data="state.targetVariable"
            />
            <dashboard-variables-form-dynamic v-show="state.selectedMethod === METHOD_TYPE.DYNAMIC_LIST_FROM_SOURCE"
                                              :is-valid.sync="state.isDynamicFormValid"
                                              :data.sync="state.dynamicGlobalVariable"
                                              :original-data="state.targetVariable"
            />
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.p-select-dropdown {
    width: 100%;
}
</style>
