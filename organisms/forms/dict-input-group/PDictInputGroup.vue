<template>
    <div class="p-dict-input-group">
        <slot name="addButton" :disabled="disabled" :addPair="addPair">
            <p-icon-text-button style-type="primary-dark"
                                class="add-btn" name="ic_plus_bold"
                                @click="addPair"
            >
                {{ $t('COMPONENT.DICT_INPUT.ADD') }}
            </p-icon-text-button>
        </slot>
        <div v-if="showHeader" class="tag-header">
            <div class="key">
                Key
            </div>
            <div class="value">
                Value
            </div>
        </div>
        <span v-for="(d, idx) in items" :key="idx" class="dict-group">
            <p-dict-input :name.sync="d.key" :value.sync="d.value"
                          :key-invalid="showValidation && invalidMessages[idx] && !!invalidMessages[idx].key"
                          :value-invalid="showValidation && invalidMessages[idx] && !!invalidMessages[idx].value"
                          :key-invalid-text="invalidMessages[idx] && invalidMessages[idx].key"
                          :value-invalid-text="invalidMessages[idx] && invalidMessages[idx].value"
                          :disabled="disabled"
                          :focused="focused"
                          @change:key="onChangeKey(idx, d, $event)"
                          @change:value="onChangeValue(idx, d, $event)"
            />
            <p-icon-button name="ic_delete" :disabled="disabled"
                           @click="deletePair(idx, d)"
            />
        </span>
    </div>
</template>

<script lang="ts">
import {
    toRefs, reactive, getCurrentInstance, Ref, UnwrapRef, ComponentRenderProxy, computed, ref, watch,
} from '@vue/composition-api';
import { DictInputGroupProps, DictItem, InvalidMessage } from '@/components/organisms/forms/dict-input-group/type';

import { makeProxy, requiredValidation, Validation } from '@/components/util/composition-helpers';
import {
    debounce, every, forEach, map, some,
} from 'lodash';

const PDictInput = () => import('@/components/molecules/forms/dict-input/PDictInput.vue');
const PIconButton = () => import('@/components/molecules/buttons/icon-button/PIconButton.vue');
const PIconTextButton = () => import('@/components/molecules/buttons/icon-text-button/PIconTextButton.vue');

const toDictItems = (dict: object = {}): DictItem[] => map(dict, (v, k) => ({ key: k || '', value: v || '' }));

interface DictValidationType {
    [idx: number]: {
        key: Validation[];
        value: Validation[];
    };
}
const getValidations = (items: Readonly<DictItem[]>): DictValidationType => {
    const res = {} as DictValidationType;

    items.forEach((di: DictItem, idx: number) => {
        res[idx] = {
            key: [
                requiredValidation('no key'),
                new Validation((val, data: DictItem[], itemIdx: number) => {
                    let isDuplicated = false;
                    some(data, (d, i) => {
                        if (d.key === val && itemIdx !== i) isDuplicated = true;
                        return isDuplicated || itemIdx <= i;
                    });
                    return !isDuplicated;
                },
                'duplicated key'),
            ],
            value: [requiredValidation('no value')],
        };
    });

    return res;
};

export default {
    name: 'PDictInputGroup',
    components: {
        PIconButton,
        PDictInput,
        PIconTextButton,
    },
    props: {
        dict: {
            type: Object,
            default: () => ({}),
        },
        showValidation: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        showEmptyInput: {
            type: Boolean,
            default: false,
        },
        showHeader: {
            type: Boolean,
            default: false,
        },
        focused: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: DictInputGroupProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            items: toDictItems(props.dict) as DictItem[],
            validations: computed<DictValidationType>(() => getValidations(state.items)),
            invalidMessages: {} as InvalidMessage,
            isAllValid: computed<boolean>(() => every(state.invalidMessages, (msg: any) => !msg.key && !msg.value)),
        });

        watch(() => props.dict, () => {
            state.items = toDictItems(props.dict);
        });

        const getDict = () => {
            const res = {};
            forEach(state.items, (item, idx) => {
                if (!state.invalidMessages[idx].key) { res[item.key] = item.value; }
            });
            return res;
        };

        const typeValidation = (idx: number, type: string) => {
            const vds: Validation[] = state.validations[idx][type];
            const isValid = vds.every((vd: Validation) => {
                const check = vd.func(state.items[idx][type], state.items, idx);
                const msg = check ? '' : vd.invalidMessage;
                state.invalidMessages = {
                    ...state.invalidMessages,
                    [idx]: { ...state.invalidMessages[idx], [type]: msg },
                };
                return check;
            });
            return isValid;
        };

        const itemValidation = (idx: number, type?: string) => {
            let res = true;
            if (type) res = typeValidation(idx, type);
            else {
                ['key', 'value'].forEach((t) => {
                    res = typeValidation(idx, t) && res;
                });
            }
            return res;
        };


        const allValidation = (type?: string, reset = true) => {
            if (reset) state.invalidMessages = {};

            let result = true;
            forEach(state.items, (d, idx: number) => {
                result = itemValidation(idx, type) && result;
            });
            return result;
        };

        const onChangeKey = debounce((idx: number, pair: DictItem) => {
            if (!props.showValidation) return;
            allValidation('key', false);
            vm.$emit('change', idx, pair);
        }, 100);

        const onChangeValue = debounce((idx: number, pair: DictItem) => {
            if (!props.showValidation) return;
            itemValidation(idx, 'value');
            vm.$emit('change', idx, pair);
        }, 100);

        const deletePair = (idx: number, pair: DictItem) => {
            state.items.splice(idx, 1);
            if (!props.showValidation) return;
            allValidation();
            vm.$emit('change', idx, pair);
        };

        const addPair = () => {
            const pair: DictItem = { key: '', value: '' };
            state.items.push(pair);
            itemValidation(state.items.length - 1);
            vm.$emit('change', state.items.length - 1, pair);
        };

        if (props.showEmptyInput) state.items.push({ key: '', value: '' });

        return {
            ...toRefs(state),
            onChangeKey,
            onChangeValue,
            deletePair,
            addPair,
            toDictItems,
            allValidation,
            itemValidation,
            getDict,
        };
    },
};
</script>

<style lang="postcss">
.p-dict-input-group {
    .add-btn {
        @apply text-white;
        margin-bottom: 0.5rem;
        .p-i-icon {
            margin-right: 0.5rem;
        }
    }
    .tag-header {
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
    .dict-group {
        display: flex;
        margin-bottom: 0.5rem;
        .p-dict-input {
            margin-right: 0.5rem;
        }
    }
}
</style>
