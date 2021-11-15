<template>
    <div class="tags-input-group">
        <slot name="addButton" :disabled="disabled" :addPair="addPair">
            <p-icon-text-button style-type="primary-dark"
                                class="add-btn" name="ic_plus_bold"
                                @click="addPair"
            >
                <span>{{ $t('COMMON.COMPONENTS.TAGS.ADD') }}</span>
            </p-icon-text-button>
        </slot>
        <div v-if="showHeader" class="tag-header">
            <div class="key">
                <span>{{ $t('COMMON.COMPONENTS.TAGS.KEY') }}</span>
            </div>
            <div class="value">
                <span>{{ $t('COMMON.COMPONENTS.TAGS.VALUE') }}</span>
            </div>
        </div>
        <div :class="{'mt-8': !showHeader}">
            <div v-for="(d, idx) in items" :key="idx" class="tags-group">
                <template v-if="validations[idx]">
                    <p-field-group :invalid-text="validations[idx].key.message"
                                   :invalid="showValidation && !validations[idx].key.isValid"
                                   class="input-box key"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="d.key"
                                          v-focus.lazy="focused"
                                          :invalid="invalid"
                                          :placeholder="$t('COMMON.COMPONENTS.TAGS.KEY')"
                                          :disabled="disabled"
                                          @blur="$emit('blur:key')"
                                          @focus="$emit('focus:key')"
                                          @input="handleInputKey"
                            />
                        </template>
                    </p-field-group>
                    <span class="split">:</span>
                    <p-field-group :invalid-text="validations[idx].value.message"
                                   :invalid="showValidation && !validations[idx].value.isValid"
                                   class="input-box value"
                    >
                        <p-text-input v-model="d.value"
                                      :invalid="showValidation && !validations[idx].value.isValid"
                                      :placeholder="$t('COMMON.COMPONENTS.TAGS.VALUE')"
                                      :disabled="disabled"
                                      @blur="$emit('blur:value')"
                                      @focus="$emit('focus:value')"
                                      @input="handleInputValue(d.value, idx)"
                        />
                    </p-field-group>
                    <p-icon-button name="ic_delete" :disabled="disabled" @click="deletePair(idx)" />
                </template>
            </div>
        </div>
    </div>
</template>addPair

<script lang="ts">
import { some } from 'lodash';

import {
    toRefs, reactive, getCurrentInstance, ComponentRenderProxy, computed, watch,
} from '@vue/composition-api';

import {
    PIconTextButton, PFieldGroup, PIconButton, PTextInput,
} from '@spaceone/design-system';

import {
    TagItem, TagValidation, TagsInputGroupProps, ValidationData,
} from '@/common/components/forms/tags-input-group/type';

const dictToArray = (dict): TagItem[] => Object.keys(dict).sort().map(k => ({ key: k, value: dict[k] }));

const arrayToDict = (arr) => {
    const dict = {};
    if (Array.isArray(arr)) {
        arr.forEach(({ key, value }) => {
            if (key !== '') dict[key] = value;
        });
    }
    return dict;
};

export default {
    name: 'TagsInputGroup',
    components: {
        PIconButton,
        PTextInput,
        PFieldGroup,
        PIconTextButton,
    },
    props: {
        tags: {
            type: Object,
            default: () => ({}),
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isValid: {
            type: Boolean,
            default: true,
        },
        showValidation: {
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
    setup(props: TagsInputGroupProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            items: [] as TagItem[],
            validations: [] as TagValidation[],
            isAllValid: computed(() => state.validations.every(d => d.key.isValid && d.value.isValid)),
        });

        const setTags = (tags: object) => {
            state._tags = tags;
            emit('update:tags', tags);
        };

        /* util */
        const validateKey = () => {
            const keys = state.items.map(d => d.key);

            state.items.forEach((item, idx) => {
                const validation: ValidationData = {
                    isValid: true,
                    message: '',
                };
                if (item.key.length === 0) {
                    validation.isValid = false;
                    validation.message = vm.$t('COMMON.COMPONENTS.TAGS.INVALID_NO_KEY');
                } else {
                    let isDuplicated = false;
                    some(keys, (k, kIdx) => {
                        if (item.key === k && idx !== kIdx) isDuplicated = true;
                        return isDuplicated || idx <= kIdx;
                    });
                    if (isDuplicated) {
                        validation.isValid = false;
                        validation.message = vm.$t('COMMON.COMPONENTS.TAGS.INVALID_DUPLICATED_KEY');
                    }
                }
                state.validations[idx].key = validation;
            });

            state.validations = [...state.validations];
        };
        const validateValue = (value, idx) => {
            const validation: ValidationData = {
                isValid: true,
                message: '',
            };
            if (value.length === 0) {
                validation.isValid = false;
                validation.message = vm.$t('COMMON.COMPONENTS.TAGS.INVALID_NO_VALUE');
            }
            state.validations[idx].value = validation;

            state.validations = [...state.validations];
        };
        const addPair = () => {
            const pair: TagItem = { key: '', value: '' };
            state.items = [...state.items, pair];
            state.validations.push({
                key: { isValid: false, message: vm.$t('COMMON.COMPONENTS.TAGS.INVALID_NO_KEY') },
                value: { isValid: false, message: vm.$t('COMMON.COMPONENTS.TAGS.INVALID_NO_VALUE') },
            });
        };
        const deletePair = (idx: number) => {
            state.items.splice(idx, 1);
            state.items = [...state.items];

            state.validations.splice(idx, 1);

            validateKey();
            setTags(arrayToDict(state.items));
        };

        const initValidations = () => {
            state.validations = state.items.map(() => ({
                key: { isValid: true, message: '' },
                value: { isValid: true, message: '' },
            }));

            validateKey();

            state.items.forEach((d, i) => {
                validateValue(d.value, i);
            });
        };

        const handleInputKey = () => {
            validateKey();
            setTags(arrayToDict(state.items));
        };

        const handleInputValue = (value, idx) => {
            validateValue(value, idx);
            setTags(arrayToDict(state.items));
        };

        watch(() => state.isAllValid, (after) => {
            emit('update:is-valid', after);
        }, { immediate: true });


        const init = () => {
            state.items = dictToArray(props.tags);

            if (props.showEmptyInput) {
                state.items = [...state.items, { key: '', value: '' }];
            }

            vm.$nextTick(() => {
                initValidations();
            });
        };

        watch(() => props.tags, (tags) => {
            if (tags !== state._tags) init();
        }, { immediate: true });


        return {
            ...toRefs(state),
            addPair,
            deletePair,
            validateKey,
            validateValue,
            handleInputKey,
            handleInputValue,
            init,
        };
    },
};
</script>

<style lang="postcss" scoped>
.tags-input-group {
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
    .tags-group {
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
}
</style>
