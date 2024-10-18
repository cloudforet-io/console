<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardVariablesFormDynamic
    from '@/services/dashboards/components/dashboard-detail/DashboardVariablesFormDynamic.vue';
import DashboardVariablesFormManual
    from '@/services/dashboards/components/dashboard-detail/DashboardVariablesFormManual.vue';
import type { DashboardGlobalVariableModel } from '@/services/dashboards/types/global-variable-type';



const METHOD_TYPE = {
    MANUAL_ENTRY: 'manual',
    DYNAMIC_LIST_FROM_SOURCE: 'dynamic',
} as const;
type MethodType = typeof METHOD_TYPE[keyof typeof METHOD_TYPE];
interface Props {
    visible: boolean;
    modalType: 'CREATE'|'UPDATE';
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
    modalTitle: computed(() => {
        if (props.modalType === 'CREATE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.CREATE_VARIABLE');
        return i18n.t('DASHBOARDS.DETAIL.VARIABLES.EDIT_VARIABLE');
    }),
    isAllValid: computed<boolean>(() => {
        if (!isAllValid.value) return false;
        if (state.selectedMethod === METHOD_TYPE.MANUAL_ENTRY) return state.isManualFormValid;
        return state.isDynamicFormValid;
    }),
    existingVariableNameList: computed<string[]>(() => ([])),
    existingVariableKeyList: computed<string[]>(() => ([])),
    selectedMethod: METHOD_TYPE.MANUAL_ENTRY as MethodType,
    isManualFormValid: false,
    isDynamicFormValid: false,
    //
    manualGlobalVariable: {} as Partial<DashboardGlobalVariableModel>,
    dynamicGlobalVariable: {} as Partial<DashboardGlobalVariableModel>,
    dashboardGlobalVariable: computed<DashboardGlobalVariableModel>(() => {
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
        if (state.loading) return '';
        if (!value) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.NAME_REQUIRED');
        if (state.existingVariableNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.NAME_DUPLICATED');
        return '';
    },
    variableKey(value: string) {
        if (state.loading) return '';
        if (!value) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.KEY_REQUIRED');
        if (state.existingVariableKeyList.find((d) => d === value)) return i18n.t('DASHBOARDS.DETAIL.VARIABLES.KEY_DUPLICATED');
        return '';
    },
});

/* Event */
const handleConfirm = () => {
};
const handleClickClose = () => {
    state.proxyVisible = false;
};
const handleChangeMethod = (method: MethodType) => {
    state.selectedMethod = method;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible) initForm();
});
</script>

<template>
    <p-button-modal :header-title="state.modalTitle"
                    class="notification-email-modal-wrapper"
                    :visible.sync="state.proxyVisible"
                    :loading="state.loading"
                    :disabled="!state.isAllValid"
                    @confirm="handleConfirm"
                    @cancel="handleClickClose"
                    @close="handleClickClose"
    >
        <template #body>
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
            <dashboard-variables-form-manual v-if="state.selectedMethod === METHOD_TYPE.MANUAL_ENTRY"
                                             :is-valid.sync="state.isManualFormValid"
                                             :data.sync="state.manualGlobalVariable"
            />
            <dashboard-variables-form-dynamic v-else
                                              :is-valid.sync="state.isDynamicFormValid"
                                              :data.sync="state.dynamicGlobalVariable"
            />
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.p-select-dropdown {
    width: 100%;
}
</style>
