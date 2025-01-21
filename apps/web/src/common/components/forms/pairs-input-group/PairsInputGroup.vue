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
    PairType,
} from '@/common/components/forms/pairs-input-group/type';

const props = withDefaults(defineProps<{
    pairs?: Pair;
    disabled?: boolean;
    isValid?: boolean;
    showValidation?: boolean;
    showHeader?: boolean;
    isAdministration?: boolean;
    type: PairType;
    keyAlias: string;
    valueAlias: string;
}>(), {
    pairs: () => ({}),
    disabled: false,
    isValid: true,
    showValidation: false,
    showHeader: false,
    isAdministration: false,
    type: 'TAGS',
    keyAlias: 'key',
    valueAlias: 'value',
});

const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void;
    (e: 'update-pairs', pairs: Pair): void;
}>();

const dictToArray = (dict): PairItem[] => Object.keys(dict).map((k) => ({ [props.keyAlias]: k, [props.valueAlias]: dict[k] }));

const arrayToDict = (arr: PairItem[]): Pair => {
    const dict = {};
    if (Array.isArray(arr)) {
        arr.forEach((arrItem) => {
            if (arrItem[props.keyAlias] !== '') dict[props.keyAlias] = arrItem[props.valueAlias];
        });
    }
    return dict;
};

const state = reactive({
    items: dictToArray(props.pairs) as PairItem[],
    keyValidations: computed<ValidationData[]>(() => {
        const keys = state.items.map((item) => item[props.keyAlias]);
        return state.items.map((item) => {
            const validation: ValidationData = { isValid: true, message: '' };
            if (!item[props.keyAlias] || !item[props.keyAlias].toString().length) {
                validation.isValid = false;
                validation.message = i18n.t(`COMMON.${props.type}.INVALID_NO_KEY`);
            } else {
                const isDuplicated = keys.filter((k) => k === item[props.keyAlias]).length > 1;
                if (isDuplicated) {
                    validation.isValid = false;
                    validation.message = i18n.t(`COMMON.${props.type}.INVALID_DUPLICATED_KEY`);
                }
            }
            return validation;
        });
    }),
    valueValidations: computed<ValidationData[]>(() => state.items.map((item) => {
        const validation: ValidationData = { isValid: true, message: '' };
        if (!item[props.valueAlias] || !item[props.valueAlias].toString().length) {
            validation.isValid = false;
            validation.message = i18n.t(`COMMON.${props.type}.INVALID_NO_VALUE`);
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
    state.items.push({ [props.keyAlias]: '', [props.valueAlias]: '' });
};
const handleDeletePair = (idx: number) => {
    const _items = [...state.items];
    _items.splice(idx, 1);
    state.items = _items;
};

const handleInputKeySection = (idx, val) => {
    const _items = [...state.items];
    _items[idx][props.keyAlias] = val;
    state.items = _items;
};
const handleInputValueSection = (idx, val) => {
    const _items = [...state.items];
    _items[idx][props.valueAlias] = val;
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
                <span>{{ props.isAdministration ? $t('COMMON.BUTTONS.ADD') : $t(`COMMON.${props.type}.ADD`) }}</span>
            </p-button>
        </slot>
        <div v-if="props.showHeader"
             class="pair-header"
        >
            <div class="key">
                <span>{{ $t(`COMMON.${props.type}.KEY`) }}</span>
            </div>
            <div class="value">
                <span>{{ $t(`COMMON.${props.type}.VALUE`) }}</span>
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
                        <p-text-input :value="item[props.keyAlias]"
                                      :invalid="invalid"
                                      :placeholder="props.keyAlias"
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
                        <p-text-input :value="item[props.valueAlias]"
                                      :invalid="invalid"
                                      :placeholder="props.valueAlias"
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
            @apply inline-block font-bold;
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
