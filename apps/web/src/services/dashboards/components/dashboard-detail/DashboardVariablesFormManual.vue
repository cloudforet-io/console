<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PTextInput, PSelectDropdown, PRadioGroup, PRadio, PButton, PIconButton, PDivider, PTooltip, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type {
    DashboardGlobalVariable, ManualVariable,
} from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';




const VALUES_TYPE = {
    ANY_VALUE: 'any',
    LIST_OF_VALUES: 'enum',
} as const;
type ValuesType = typeof VALUES_TYPE[keyof typeof VALUES_TYPE];
const SELECTION_TYPE = {
    MULTI_SELECT: 'multi',
    SINGLE_SELECT: 'single',
} as const;
type SelectionType = typeof SELECTION_TYPE[keyof typeof SELECTION_TYPE];
const NUMBER_INPUT_TYPE = {
    NUMBER_INPUT: 'input',
    SLIDER: 'slider',
} as const;
type NumberInputType = typeof NUMBER_INPUT_TYPE[keyof typeof NUMBER_INPUT_TYPE];
interface EnumValue {
    key: string;
    label: string;
}

type ManualVariableData = Omit<ManualVariable, 'management'|'key'|'name'|'method'>;
interface Props {
    isValid: boolean;
    originalData?: DashboardGlobalVariable;
    data: ManualVariableData;
}
const props = withDefaults(defineProps<Props>(), {
    isValid: false,
    originalData: undefined,
});
const emit = defineEmits<{(e: 'update:is-valid', isValid: boolean): void;
    (e: 'update:data', data: Partial<DashboardGlobalVariable>): void;
}>();

const state = reactive({
    proxyIsValid: useProxyValue<boolean>('isValid', props, emit),
    isAllValid: computed<boolean>(() => {
        if (state.selectedValuesType === VALUES_TYPE.ANY_VALUE) {
            if (state.selectedType === 'text') return true;
            if (Number.isNaN(parseFloat(state.min)) || Number.isNaN(parseFloat(state.max))) return false;
            if (state.isStepValid === false) return false;
            return state.min !== undefined && state.max !== undefined;
        }
        const keys = state.enumValues.map((d) => d.key);
        return new Set(keys).size === keys.length && state.enumValues.every((d) => !!d.key);
    }),
    manualGlobalVariableData: computed<Partial<DashboardGlobalVariable>>(() => {
        if (state.selectedValuesType === VALUES_TYPE.ANY_VALUE) {
            if (state.selectedType === 'text') {
                return {
                    method: 'manual',
                    type: 'text',
                    valueType: 'any',
                    options: {
                        defaultValue: state.defaultTextValue,
                    },
                };
            }
            return {
                method: 'manual',
                type: 'number',
                valueType: 'any',
                options: {
                    min: parseFloat(state.min),
                    max: parseFloat(state.max),
                    step: parseFloat(state.step),
                    inputType: state.selectedNumberInputType,
                },
            };
        }
        return {
            method: 'manual',
            type: state.selectedType,
            valueType: 'enum',
            values: state.enumValues,
            options: {
                selectionType: state.selectedSelectionType,
            },
        };
    }),
    typeMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        { name: 'text', label: i18n.t('DASHBOARDS.DETAIL.VARIABLES.TEXT') },
        { name: 'number', label: i18n.t('DASHBOARDS.DETAIL.VARIABLES.NUMBER') },
    ])),
    selectedType: 'text' as 'text'|'number',
    selectedValuesType: VALUES_TYPE.ANY_VALUE as ValuesType,
    defaultTextValue: undefined as string|undefined,
    enumValues: [] as EnumValue[],
    selectedSelectionType: 'multi' as SelectionType,
    min: undefined as number|undefined,
    max: undefined as number|undefined,
    step: undefined as number|undefined,
    selectedNumberInputType: NUMBER_INPUT_TYPE.NUMBER_INPUT as NumberInputType,
    isStepValid: computed<boolean>(() => {
        if (state.max === undefined || state.min === undefined || (!state.step && state.step !== 0)) return true;
        return state.max % state.step === 0;
    }),
});

/* Util */
const initExistingVariable = (originalData: DashboardGlobalVariable) => {
    if (originalData.method !== 'manual') return;
    state.selectedType = originalData.type;
    state.selectedValuesType = originalData.valueType;
    if (originalData.type === 'text') {
        if (originalData.valueType === 'any') {
            state.defaultTextValue = originalData.options?.defaultValue;
        } else {
            state.enumValues = originalData.values;
            state.selectedSelectionType = originalData.options.selectionType;
        }
    } else if (originalData.valueType === 'any') {
        state.min = originalData.options.min;
        state.max = originalData.options.max;
        state.step = originalData.options.step;
        state.selectedNumberInputType = originalData.options.inputType;
    } else {
        state.enumValues = originalData.values;
        state.selectedSelectionType = originalData.options.selectionType;
    }
};

/* Event */
const handleChangeType = (type: 'text'|'number') => {
    if (state.selectedType === type) return;
    state.selectedType = type;
    state.defaultTextValue = undefined;
    state.min = undefined;
    state.max = undefined;
    state.enumValues = [{ key: '', label: '' }];
};
const handleChangeValuesType = (type: ValuesType) => {
    if (state.selectedValuesType === type) return;
    state.selectedValuesType = type;
    if (type === VALUES_TYPE.LIST_OF_VALUES) {
        state.enumValues = [{ key: '', label: '' }];
    } else {
        state.enumValues = [];
    }
};
const handleChangeSelectionType = (type: SelectionType) => {
    state.selectedSelectionType = type;
};
const handleDeleteEnumValue = (idx: number) => {
    state.enumValues.splice(idx, 1);
};
const handleAddValue = () => {
    state.enumValues.push({ key: '', label: '' });
};
// const handleUpdateEnumLabel = (idx: number, value: string) => {
//     state.enumValues[idx].label = value;
// };
const handleUpdateEnumKey = (idx: number, value: string) => {
    state.enumValues[idx].key = value;
    state.enumValues[idx].label = value;
};
const handleChangeNumberInputType = (type: NumberInputType) => {
    state.selectedNumberInputType = type;
};
// const handleUpdateDisplayKey = (value: boolean[]) => {
//     state.displayKeyWithLabel = value[0];
// };

/* Watcher */
watch(() => state.manualGlobalVariableData, (data) => {
    emit('update:data', data);
}, { deep: true, immediate: true });
watch(() => state.isAllValid, (isValid) => {
    state.proxyIsValid = isValid;
}, { immediate: true });
watch(() => props.originalData, (originalData) => {
    if (originalData) initExistingVariable(originalData);
}, { immediate: true });
</script>

<template>
    <div class="dashboard-variables-form-manual">
        <!-- Type -->
        <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.TYPE')"
                       required
                       class="col-span-12"
        >
            <p-select-dropdown :selected="state.selectedType"
                               :menu="state.typeMenuItems"
                               use-fixed-menu-style
                               class="w-1/2"
                               @select="handleChangeType"
            />
        </p-field-group>
        <!-- Values -->
        <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.VALUES')"
                       required
                       class="col-span-12"
        >
            <p-radio-group>
                <p-radio :value="VALUES_TYPE.ANY_VALUE"
                         :selected="state.selectedValuesType"
                         @change="handleChangeValuesType"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.ANY_VALUE') }}
                </p-radio>
                <p-radio :value="VALUES_TYPE.LIST_OF_VALUES"
                         :selected="state.selectedValuesType"
                         @change="handleChangeValuesType"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.LIST_OF_VALUES') }}
                </p-radio>
            </p-radio-group>
        </p-field-group>
        <div class="values-wrapper">
            <!-- Any -->
            <template v-if="state.selectedValuesType === VALUES_TYPE.ANY_VALUE">
                <!-- Any / Text -->
                <p-field-group v-if="state.selectedType === 'text'"
                               :label="$t('DASHBOARDS.DETAIL.VARIABLES.DEFAULT_VALUE')"
                >
                    <p-text-input :value.sync="state.defaultTextValue"
                                  block
                    />
                </p-field-group>
                <!-- Any / Number -->
                <div v-else
                     class="grid grid-cols-12 gap-2"
                >
                    <div class="col-span-9 grid grid-cols-12 gap-2">
                        <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.MIN')"
                                       required
                                       class="col-span-6"
                        >
                            <p-text-input :value.sync="state.min"
                                          type="number"
                                          block
                            />
                        </p-field-group>
                        <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.MAX')"
                                       required
                                       class="col-span-6"
                        >
                            <p-text-input :value.sync="state.max"
                                          type="number"
                                          block
                            />
                        </p-field-group>
                    </div>
                    <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.STEP')"
                                   class="col-span-3"
                    >
                        <p-text-input :value.sync="state.step"
                                      block
                                      type="number"
                                      :invalid="!state.isStepValid"
                        />
                        <template #label-extra>
                            <p-tooltip position="bottom"
                                       :contents="$t('DASHBOARDS.DETAIL.VARIABLES.STEP_TOOLTIP')"
                            >
                                <p-i name="ic_info-circle"
                                     height="0.75rem"
                                     width="0.75rem"
                                     color="inherit"
                                     class="ml-2"
                                />
                            </p-tooltip>
                        </template>
                    </p-field-group>
                    <!-- Input Type -->
                    <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.INPUT_TYPE')"
                                   required
                                   class="col-span-12"
                    >
                        <p-radio-group>
                            <p-radio :value="NUMBER_INPUT_TYPE.NUMBER_INPUT"
                                     :selected="state.selectedNumberInputType"
                                     @change="handleChangeNumberInputType"
                            >
                                {{ $t('DASHBOARDS.DETAIL.VARIABLES.NUMBER_INPUT') }}
                            </p-radio>
                            <p-radio :value="NUMBER_INPUT_TYPE.SLIDER"
                                     :selected="state.selectedNumberInputType"
                                     @change="handleChangeNumberInputType"
                            >
                                {{ $t('DASHBOARDS.DETAIL.VARIABLES.SLIDER') }}
                            </p-radio>
                        </p-radio-group>
                    </p-field-group>
                </div>
            </template>
            <!-- List -->
            <template v-else>
                <div class="list-of-values-wrapper">
                    <div v-for="(enumValue, enumIdx) in state.enumValues"
                         :key="`enum-value-${enumIdx}`"
                         class="list-of-values-row"
                    >
                        <!--                        <p-text-input :value="enumValue.label"-->
                        <!--                                      placeholder="Label"-->
                        <!--                                      block-->
                        <!--                                      @update:value="handleUpdateEnumLabel(enumIdx, $event)"-->
                        <!--                        />-->
                        <!--                        <span>:</span>-->
                        <p-text-input :value="enumValue.key"
                                      placeholder="Key"
                                      block
                                      :invalid="state.enumValues.some((d, idx) => d.key === enumValue.key && idx !== enumIdx)"
                                      :type="state.selectedType"
                                      @update:value="handleUpdateEnumKey(enumIdx, $event)"
                        />
                        <p-icon-button name="ic_delete"
                                       style-type="negative-transparent"
                                       size="sm"
                                       :disabled="state.enumValues.length === 1"
                                       class="flex-shrink-0"
                                       @click="handleDeleteEnumValue(enumIdx)"
                        />
                    </div>
                </div>
                <p-button icon-left="ic_plus_bold"
                          style-type="secondary"
                          class="mt-2"
                          @click="handleAddValue"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.ADD_VALUE') }}
                </p-button>
                <!--                <p-checkbox v-if="state.selectedType === 'number'"-->
                <!--                            :selected="state.displayKeyWithLabel"-->
                <!--                            :value="true"-->
                <!--                            class="pt-3 block"-->
                <!--                            @change="handleUpdateDisplayKey"-->
                <!--                >-->
                <!--                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.DISPLAY_KEY_WITH_LABEL') }}-->
                <!--                </p-checkbox>-->
                <!-- Selection Type -->
                <p-divider class="divider" />
                <p-field-group :label="$t('DASHBOARDS.DETAIL.VARIABLES.SELECTION_TYPE')"
                               required
                >
                    <p-radio-group>
                        <p-radio :value="SELECTION_TYPE.MULTI_SELECT"
                                 :selected="state.selectedSelectionType"
                                 @change="handleChangeSelectionType"
                        >
                            {{ $t('DASHBOARDS.DETAIL.VARIABLES.MULTI_SELECT') }}
                        </p-radio>
                        <p-radio :value="SELECTION_TYPE.SINGLE_SELECT"
                                 :selected="state.selectedSelectionType"
                                 @change="handleChangeSelectionType"
                        >
                            {{ $t('DASHBOARDS.DETAIL.VARIABLES.SINGLE_SELECT') }}
                        </p-radio>
                    </p-radio-group>
                </p-field-group>
            </template>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variables-form-manual {
    @apply bg-gray-100 rounded-md;
    padding: 0.75rem 1rem;
}
.values-wrapper {
    .list-of-values-wrapper {
        @apply bg-white border border-gray-200 rounded-md text-gray-300;
        padding: 0.25rem;
        .list-of-values-row {
            @apply flex items-center justify-between;
            display: flex;
            gap: 0.25rem;
            padding: 0.25rem 0;
        }
    }
    .divider {
        margin: 0.75rem 0;
    }
}
</style>
