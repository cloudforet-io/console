<template>
    <div class="tags-input-group">
        <slot name="add-button"
              :disabled="disabled"
              :handle-add-pair="handleAddPair"
        >
            <p-button class="add-button"
                      style-type="secondary"
                      icon-left="ic_plus_bold"
                      @click="handleAddPair"
            >
                <span>{{ isAdministration ? t('COMMON.TAGS.ADD') : t('COMMON.TAGS.ADD_TAG') }}</span>
            </p-button>
        </slot>
        <div v-if="showHeader"
             class="tag-header"
        >
            <div class="key">
                <span>{{ t('COMMON.COMPONENTS.TAGS.KEY') }}</span>
            </div>
            <div class="value">
                <span>{{ t('COMMON.COMPONENTS.TAGS.VALUE') }}</span>
            </div>
        </div>
        <div :class="isAdministration && 'is-administration'">
            <div v-for="(item, idx) in state.items"
                 :key="idx"
                 class="tags-group"
            >
                <p-field-group :invalid-text="state.keyValidations[idx].message"
                               :invalid="showValidation && !state.keyValidations[idx].isValid"
                               class="input-box key"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="item.key"
                                      :invalid="invalid"
                                      :placeholder="t('COMMON.COMPONENTS.TAGS.KEY')"
                                      :disabled="disabled"
                                      @update:value="handleInputKey(idx, ...arguments)"
                        />
                    </template>
                </p-field-group>
                <span class="split">:</span>
                <p-field-group :invalid-text="state.valueValidations[idx].message"
                               :invalid="showValidation && !state.valueValidations[idx].isValid"
                               class="input-box value"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="item.value"
                                      :invalid="invalid"
                                      :placeholder="t('COMMON.COMPONENTS.TAGS.VALUE')"
                                      :disabled="disabled"
                                      @update:value="handleInputValue(idx, ...arguments)"
                        />
                    </template>
                </p-field-group>
                <p-icon-button name="ic_close"
                               :disabled="disabled"
                               @click="handleDeletePair(idx)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

import {
    PButton, PFieldGroup, PIconButton, PTextInput,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type {
    Tag, TagItem, ValidationData,
} from '@/common/components/forms/tags-input-group/type';

const dictToArray = (dict): TagItem[] => Object.keys(dict).map((k) => ({ key: k, value: dict[k] }));

const arrayToDict = (arr: TagItem[]): Tag => {
    const dict = {};
    if (Array.isArray(arr)) {
        arr.forEach(({ key, value }) => {
            if (key !== '') dict[key] = value;
        });
    }
    return dict;
};

interface Props {
    tags: Tag,
    disabled?: boolean,
    isValid?: boolean,
    showValidation?: boolean,
    showHeader?: boolean,
    focused?: boolean,
    isAdministration?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
    tags: () => ({}),
    disabled: false,
    isValid: true,
    showValidation: false,
    showHeader: false,
    focused: true,
    isAdministration: false,
});
const emit = defineEmits<{(e: 'update:is-valid', value: boolean): void;
    (e: 'update-tags', value: Tag): void;
}>();
const { t } = useI18n();

const state = reactive({
    items: dictToArray(props.tags) as TagItem[],
    keyValidations: computed<ValidationData[]>(() => {
        const keys = state.items.map((item) => item.key);
        return state.items.map((item) => {
            const validation: ValidationData = { isValid: true, message: '' };
            if (!item.key || !item.key.toString().length) {
                validation.isValid = false;
                validation.message = t('COMMON.COMPONENTS.TAGS.INVALID_NO_KEY');
            } else {
                const isDuplicated = keys.filter((k) => k === item.key).length > 1;
                if (isDuplicated) {
                    validation.isValid = false;
                    validation.message = t('COMMON.COMPONENTS.TAGS.INVALID_DUPLICATED_KEY');
                }
            }
            return validation;
        });
    }),
    valueValidations: computed<ValidationData[]>(() => state.items.map((item) => {
        const validation: ValidationData = { isValid: true, message: '' };
        if (!item.value || !item.value.toString().length) {
            validation.isValid = false;
            validation.message = t('COMMON.COMPONENTS.TAGS.INVALID_NO_VALUE');
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
    state.items = [...state.items, { key: '', value: '' }];
};
const handleDeletePair = (idx: number) => {
    const _items = [...state.items];
    _items.splice(idx, 1);
    state.items = _items;
};

const handleInputKey = (idx, val) => {
    const _items = [...state.items];
    _items[idx].key = val;
    state.items = _items;
};
const handleInputValue = (idx, val) => {
    const _items = [...state.items];
    _items[idx].value = val;
    state.items = _items;
};

/* Watcher */
watch(() => state.isAllValid, (after) => {
    emit('update:is-valid', after);
}, { immediate: true });
watch(() => state.items, (items) => {
    emit('update-tags', arrayToDict(items));
});
const stopTagInit = watch(() => props.tags, (tags) => {
    if (!isEmpty(tags)) state.items = dictToArray(tags);
    if (stopTagInit) stopTagInit();
});

</script>

<style lang="postcss" scoped>
.tags-input-group {
    .add-button {
        margin: 1rem 0 1.5rem;
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
    .is-administration {
        .tags-group {
            .input-box {
                width: 100%;
            }
        }
    }
}
</style>
