<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import {
    PButton, PFieldGroup, PIconButton, PTextInput,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import type {
    Pair, PairItem, ValidationData,
    I18nLabels, PairConfig,
} from '@/common/components/forms/pairs-input-group/type';

const props = withDefaults(defineProps<{
    pairs?: Pair;
    disabled?: boolean;
    isValid?: boolean;
    showValidation?: boolean;
    showHeader?: boolean;
    isAdministration?: boolean;
    pairConfig?: PairConfig;
    i18nLabels?: I18nLabels;
}>(), {
    pairs: () => ({}),
    disabled: false,
    isValid: true,
    showValidation: false,
    showHeader: false,
    isAdministration: false,
    pairConfig: () => ({
        keyLabel: 'key',
        valueLabel: 'value',
    }),
    i18nLabels: () => ({
        INVALID_DUPLICATE_KEY: i18n.t('COMMON.TAGS.INVALID_DUPLICATED_KEY'),
        INVALID_KEY: i18n.t('COMMON.TAGS.INVALID_NO_KEY'),
        INVALID_VALUE: i18n.t('COMMON.TAGS.INVALID_NO_VALUE'),
        ADD_PAIR_BUTTON: i18n.t('COMMON.TAGS.ADD'),
        KEY_LABEL: i18n.t('COMMON.TAGS.KEY'),
        VALUE_LABEL: i18n.t('COMMON.TAGS.VALUE'),
    }),
});

const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void;
    (e: 'update-pairs', pairs: Pair): void;
}>();

const dictToArray = (dict): PairItem[] => Object.keys(dict).map((k) => ({ [props.pairConfig.keyLabel]: k, [props.pairConfig.valueLabel]: dict[k] }));

const arrayToDict = (arr: PairItem[]): Pair => {
    const dict: Record<string, string> = {};
    if (Array.isArray(arr)) {
        arr.forEach((arrItem) => {
            const key = arrItem[props.pairConfig.keyLabel];
            const value = arrItem[props.pairConfig.valueLabel];

            if (typeof key === 'string' && key.trim() !== '') {
                dict[key] = String(value);
            }
        });
    }
    return dict;
};

const state = reactive({
    items: dictToArray(props.pairs) as PairItem[],
    keyValidations: computed<ValidationData[]>(() => {
        const keys = state.items.map((item) => item[props.pairConfig.keyLabel]);
        return state.items.map((item) => {
            const validation: ValidationData = { isValid: true, message: '' };
            if (!item[props.pairConfig.keyLabel] || !item[props.pairConfig.keyLabel].toString().length) {
                validation.isValid = false;
                validation.message = props.i18nLabels?.INVALID_KEY || '';
            } else {
                const isDuplicated = keys.filter((k) => k === item[props.pairConfig.keyLabel]).length > 1;
                if (isDuplicated) {
                    validation.isValid = false;
                    validation.message = props.i18nLabels?.INVALID_DUPLICATE_KEY || '';
                }
            }
            return validation;
        });
    }),
    valueValidations: computed<ValidationData[]>(() => state.items.map((item) => {
        const validation: ValidationData = { isValid: true, message: '' };
        if (!item[props.pairConfig.valueLabel] || !item[props.pairConfig.valueLabel].toString().length) {
            validation.isValid = false;
            validation.message = props.i18nLabels?.INVALID_VALUE || '';
        }
        return validation;
    })),
    isAllValid: computed(() => {
        const isKeyValid = state.keyValidations.every((d) => d.isValid);
        const isValueValid = state.valueValidations.every((d) => d.isValid);
        return isKeyValid && isValueValid;
    }),
});

/* Event */
const handleAddPair = () => {
    state.items.push({ [props.pairConfig.keyLabel]: '', [props.pairConfig.valueLabel]: '' });
};
const handleDeletePair = (idx: number) => {
    const _items = [...state.items];
    _items.splice(idx, 1);
    state.items = _items;
};

const handleInputKeySection = (idx, val) => {
    const _items = [...state.items];
    _items[idx][props.pairConfig.keyLabel] = val;
    state.items = _items;
};
const handleInputValueSection = (idx, val) => {
    const _items = [...state.items];
    _items[idx][props.pairConfig.valueLabel] = val;
    state.items = _items;
};

/* Watcher */
watch(() => state.isAllValid, (after) => {
    emit('update:is-valid', after);
}, { immediate: true });
watch(() => state.items, (items) => {
    emit('update-pairs', arrayToDict(items));
});
const stopPairInit = watch(() => props.pairs, (pairs) => {
    if (!isEmpty(pairs)) state.items = dictToArray(pairs);
    if (stopPairInit) stopPairInit();
});
</script>

<template>
    <div class="pairs-input-group">
        <slot name="add-button"
              :disabled="props.disabled"
              :handle-add-pair="handleAddPair"
        >
            <p-button class="add-button"
                      style-type="secondary"
                      icon-left="ic_plus_bold"
                      @click="handleAddPair"
            >
                <span>{{ props.i18nLabels?.ADD_PAIR_BUTTON }}</span>
            </p-button>
        </slot>
        <div v-if="props.showHeader"
             class="pair-header"
        >
            <div class="key">
                <span>{{ props.i18nLabels?.KEY_LABEL || '' }}</span>
            </div>
            <div class="value">
                <span>{{ props.i18nLabels?.VALUE_LABEL || '' }}</span>
            </div>
        </div>
        <div :class="props.isAdministration && 'is-administration'">
            <div v-for="(item, idx) in state.items"
                 :key="idx"
                 class="pair-group"
            >
                <p-field-group :invalid-text="state.keyValidations[idx].message"
                               :invalid="props.showValidation && !state.keyValidations[idx].isValid"
                               class="input-box key"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="item[props.pairConfig.keyLabel]"
                                      :invalid="invalid"
                                      :placeholder="props.pairConfig.keyLabel"
                                      :disabled="props.disabled"
                                      @update:value="handleInputKeySection(idx, ...arguments)"
                        />
                    </template>
                </p-field-group>
                <span class="split">:</span>
                <p-field-group :invalid-text="state.valueValidations[idx].message"
                               :invalid="props.showValidation && !state.valueValidations[idx].isValid"
                               class="input-box value"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="item[props.pairConfig.valueLabel]"
                                      :invalid="invalid"
                                      :placeholder="props.pairConfig.valueLabel"
                                      :disabled="props.disabled"
                                      @update:value="handleInputValueSection(idx, ...arguments)"
                        />
                    </template>
                </p-field-group>
                <p-icon-button name="ic_close"
                               :disabled="props.disabled"
                               @click="handleDeletePair(idx)"
                />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.pairs-input-group {
    .add-button {
        margin: 1rem 0 1.5rem;
    }
    .pair-header {
        @apply py-4;
        .key {
            @apply inline-block font-bold;
            width: 15rem;
        }
        .value {
            @apply inline-block font-bold pl-2;
            width: 20rem;
        }
    }
    .pair-group {
        display: flex;
        margin-bottom: 0.5rem;

        .input-box {
            display: inline-block;
            margin-bottom: 0;
            &.key {
                width: 15rem;
            }
            &.value {
                width: 20rem;
            }

            .p-text-input {
                width: 100%;
                &.invalid {
                    @apply border border-alert;
                }
            }
        }
        .split {
            padding-left: 0.125rem;
            padding-right: 0.125rem;
            line-height: 2rem;
        }
    }
    .is-administration {
        .tags-group {
            .input-box {
                width: 100%;
            }
        }
    }
}
</style>
