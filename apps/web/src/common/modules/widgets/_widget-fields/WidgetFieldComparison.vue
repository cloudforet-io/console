<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldTitle, PToggleButton, PFieldGroup, PSelectDropdown, PDivider,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useProxyValue } from '@/common/composables/proxy-state';
import { DEFAULT_COMPARISON_COLOR } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { ComparisonOptions, WidgetFieldComponentProps, WidgetFieldComponentEmit } from '@/common/modules/widgets/types/widget-field-type';
import type { ComparisonFormat, ComparisonValue } from '@/common/modules/widgets/types/widget-field-value-type';


const emit = defineEmits<WidgetFieldComponentEmit<ComparisonValue[]|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<ComparisonOptions>>(), {
    widgetFieldSchema: () => ({
        options: {
            toggle: false,
        },
    }),
});

const state = reactive({
    toggleValue: !!props.value,
    proxyValue: useProxyValue<ComparisonValue[]|undefined>('value', props, emit),
    // compareWith: computed(() => {
    //     const granularity = props.widgetFieldSchema.options?.granularity ?? GRANULARITY.DAILY;
    //     if (granularity === GRANULARITY.MONTHLY) return i18n.t('COMMON.WIDGETS.COMPARISON.PREVIOUS_MONTH');
    //     if (granularity === GRANULARITY.YEARLY) return i18n.t('COMMON.WIDGETS.COMPARISON.PREVIOUS_YEAR');
    //     return i18n.t('COMMON.WIDGETS.COMPARISON.PREVIOUS_DAY');
    // }),
    // isForTable: computed(() => props.widgetFieldSchema.options?.forTable ?? false),
    initialValue: computed<ComparisonValue>(() => ({
        decreaseColor: DEFAULT_COMPARISON_COLOR.DECREASE,
        increaseColor: DEFAULT_COMPARISON_COLOR.INCREASE,
        format: 'all',
    })),
    formatMenu: [
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.ALL'), name: 'all' },
        { label: `${i18n.t('COMMON.WIDGETS.COMPARISON.PERCENT')}(%)`, name: 'percent' },
        { label: i18n.t('COMMON.WIDGETS.COMPARISON.FIXED'), name: 'fixed' },
    ],
});

// const handleAddComparison = () => {
//     state.proxyValue.push(cloneDeep(state.initialValue));
//     state.isFieldNameValid.push(undefined);
//     emit('update:value', state.proxyValue);
// };

// { key, index }:{key: 'decreaseColor'|'increaseColor'; index: number}
const handleUpdateColor = (key:string, index:number, color:string) => {
    if (!state.proxyValue) return;
    const clonedValue = cloneDeep(state.proxyValue);
    clonedValue[index][key] = color;
    state.proxyValue = clonedValue;
};
const handleUpdateToggle = (value: boolean) => {
    state.toggleValue = value;
    if (value) {
        initValue();
        state.proxyValue = [cloneDeep(state.initialValue)];
    } else {
        state.proxyValue = undefined;
    }
};

const handleUpdateFormat = (format: ComparisonFormat, index: number) => {
    if (!state.proxyValue) return;
    const clonedValue = cloneDeep(state.proxyValue);
    clonedValue[index].format = format;
    state.proxyValue = clonedValue;
};

// const handleUpdateFieldName = (fieldName: string, index:number) => {
//     state.proxyValue[index].fieldName = fieldName;
//     const updatedValue = cloneDeep(state.isFieldNameValid);
//     updatedValue[index] = fieldName.length > 0;
//     state.isFieldNameValid = updatedValue;
// };

const checkValue = ():boolean => {
    if (state.toggleValue) {
        return !!state.proxyValue?.every((item) => item.decreaseColor && item.increaseColor && item.format);
    }
    return true;
};

watch(() => state.proxyValue, () => {
    emit('update:is-valid', checkValue());
}, { immediate: true });

const initValue = () => {
    if (props.value !== undefined) {
        state.proxyValue = cloneDeep(props.value);
    } else if (props.widgetFieldSchema.options?.toggle ?? false) {
        state.proxyValue = [cloneDeep(state.initialValue)];
    } else {
        state.proxyValue = undefined;
    }
};

onMounted(() => {
    if (!state.toggleValue) state.proxyValue = undefined;
    else {
        initValue();
    }
});

</script>

<template>
    <div class="widget-field-total">
        <div class="field-header">
            <p-field-title>{{ $t('COMMON.WIDGETS.COMPARISON.COMPARISON') }}</p-field-title>
            <p-toggle-button :value="state.toggleValue"
                             @update:value="handleUpdateToggle"
            />
        </div>
        <div v-if="state.toggleValue"
             class="contents-box"
        >
            <!--             :class="{'for-table': state.isForTable}"-->
            <div v-for="(item, index) in state.proxyValue"
                 :key="index"
                 class="form-container"
            >
                <div class="mb-2">
                    <p-divider v-if="index !== 0" />
                </div>
                <!--                <p-field-group v-if="state.isForTable"-->
                <!--                               :label="$t('COMMON.WIDGETS.COMPARISON.FIELD_NAME')"-->
                <!--                               :invalid="state.isFieldNameValid[index] === false"-->
                <!--                               :invalid-text="$t('COMMON.WIDGETS.COMPARISON.NAME_INVALID_TEXT')"-->
                <!--                               style-type="secondary"-->
                <!--                               required-->
                <!--                >-->
                <!--                    <p-text-input :value="state.proxyValue[index].fieldName"-->
                <!--                                  :invalid="state.isFieldNameValid[index] === false"-->
                <!--                                  class="w-full"-->
                <!--                                  @update:value="(name) => handleUpdateFieldName(name, index)"-->
                <!--                    />-->
                <!--                </p-field-group>-->
                <div class="row-1">
                    <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.COMPARE_WITH')"
                                   class="left"
                                   style-type="secondary"
                                   required
                    >
                        <span class="compare-with">{{ $t('COMMON.WIDGETS.COMPARISON.PREVIOUS_PERIOD') }}</span>
                    </p-field-group>
                    <!--                    <p-field-group v-if="state.isForTable"-->
                    <!--                                   :label="$t('COMMON.WIDGETS.COMPARISON.COMPARE_TARGET')"-->
                    <!--                                   style-type="secondary"-->
                    <!--                                   class="w-full"-->
                    <!--                                   required-->
                    <!--                    >-->
                    <!--                        <p-select-dropdown class="w-full"-->
                    <!--                                           :menu="[1,2]"-->
                    <!--                        />-->
                    <!--                    </p-field-group>-->
                </div>
                <div class="row-2">
                    <div class="left">
                        <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.DECREASE')"
                                       style-type="secondary"
                                       required
                        >
                            <color-input :value="state.proxyValue[index].decreaseColor"
                                         @update:value="(color) => handleUpdateColor('decreaseColor', index, color)"
                            />
                        </p-field-group>
                        <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.INCREASE')"
                                       style-type="secondary"
                                       required
                        >
                            <color-input :value="state.proxyValue[index].increaseColor"
                                         @update:value="(color) => handleUpdateColor('increaseColor', index, color)"
                            />
                        </p-field-group>
                    </div>
                    <p-field-group :label="$t('COMMON.WIDGETS.COMPARISON.FORMAT')"
                                   class="w-full"
                                   style-type="secondary"
                                   required
                    >
                        <p-select-dropdown :menu="state.formatMenu"
                                           use-fixed-menu-style
                                           class="w-full"
                                           :selected="state.proxyValue[index].format"
                                           @update:selected="(format) => handleUpdateFormat(format, index)"
                        />
                    </p-field-group>
                </div>
            </div>
            <!--            <p-button v-if="state.isForTable"-->
            <!--                      style-type="tertiary"-->
            <!--                      icon-left="ic_plus_bold"-->
            <!--                      @click="handleAddComparison"-->
            <!--            >-->
            <!--                {{ $t('COMMON.WIDGETS.COMPARISON.ADD_COMPARISON') }}-->
            <!--            </p-button>-->
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-field-total {
    .field-header {
        @apply flex items-center gap-1 justify-between;
    }

    .contents-box {
        margin-top: 0.5rem;
        &.for-table {
            @apply p-2 bg-gray-100 rounded;
        }

        .row-1 {
            @apply flex gap-2;

            .left {
                flex-shrink: 0;
                width: 10rem;
            }

            .compare-with {
                @apply text-label-md text-gray-800;
            }
        }

        .row-2 {
            @apply flex gap-2;
            .left {
                @apply flex gap-3;
                flex-shrink: 0;
                width: 10rem;
            }
        }
    }
}
</style>
