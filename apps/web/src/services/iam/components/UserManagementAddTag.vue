<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PFieldGroup, PTextButton, PTextInput } from '@spaceone/design-system';
import type { InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';

import type { Tags } from '@/schema/_common/model';
import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import { getInputItemsFromTagKeys } from '@/services/iam/composables/tag-data';

interface Props {
    tags: Tags;
    isBordered?: boolean;
    isEdit?: boolean;
    isFormVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tags: undefined,
    isBordered: false,
    isEdit: false,
    isFormVisible: false,
});

const emit = defineEmits<{(e: 'update:tags', role: Tags): void,
}>();

const state = reactive({
    formVisible: false,
    searchText: '',
    proxyTags: useProxyValue('tags', props, emit),
    selected: getInputItemsFromTagKeys(props.tags),
});
const validationState = reactive({
    isValid: true as undefined | boolean,
    invalidText: '' as TranslateResult | string,
});

/* Component */
const handleClickButton = () => {
    state.formVisible = true;
};
const handleChangeInput = (event) => {
    state.searchText = event.target.value;
    validationState.isValid = true;
    validationState.invalidText = '';
};
const handleEnterKey = () => {
    if (state.searchText === '') return;
    if (!state.searchText.includes(':') || state.searchText.split(':').length > 2) {
        validationState.isValid = false;
        validationState.invalidText = i18n.t('IAM.ALT_E_TAG_FORMAT');
        return;
    }
    const isExistItem = state.selected.findIndex((item) => item.name === state.searchText);
    if (isExistItem !== -1) {
        validationState.isValid = false;
        validationState.invalidText = i18n.t('IAM.ALT_E_TAG_DUPLICATION');
        return;
    }
    state.selected.push({ label: state.searchText, name: state.searchText });
    handleUpdateSelected();
    validationState.isValid = true;
    validationState.invalidText = '';
    state.searchText = '';
};
const handleUpdateSelected = (items?: InputItem[]) => {
    if (items) state.selected = items;
    const refinedTags = state.selected.map((item) => {
        const tags = item.name.split(':').map((tag) => tag.trim());
        return { [tags[0]]: tags[1] };
    });

    state.proxyTags = Object.assign({}, ...refinedTags);
};

/* Watcher */
watch(() => props.isFormVisible, (value) => {
    if (value) state.formVisible = true;
}, { immediate: true });
</script>

<template>
    <div class="user-add-tag-wrapper"
         :class="{'is-bordered': props.isBordered}"
    >
        <p-text-button v-if="!state.formVisible"
                       icon-left="ic_plus_bold"
                       style-type="highlight"
                       class="add-tag-text-button"
                       @click="handleClickButton"
        >
            {{ $t('IAM.USER.FORM.ADD_TAG') }}
        </p-text-button>
        <div v-else
             class="user-add-tag-form"
        >
            <p-field-group :label="$t('IAM.USER.FORM.TAGS')"
                           :invalid-text="validationState.invalidText"
                           :invalid="!validationState.isValid"
                           class="input-form"
            >
                <p-text-input class="text-input"
                              multi-input
                              :invalid="!validationState.isValid"
                              :selected="state.selected"
                              appearance-type="stack"
                              block
                              @update:selected="handleUpdateSelected"
                >
                    <input :placeholder="$t('IDENTITY.TAGS_PLACEHOLDER')"
                           :value="state.searchText"
                           @input="handleChangeInput"
                           @keyup.enter="handleEnterKey"
                    >
                </p-text-input>
            </p-field-group>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-add-tag-wrapper {
    .add-tag-text-button {
        margin: auto;
    }
    .user-add-tag-form {
        @apply flex flex-col bg-white rounded-md;
        padding: 0.75rem;
        .input-form {
            margin-bottom: 0;
            .text-input {
                margin-top: 0.25rem;
            }
        }
    }
    &.is-bordered {
        .user-add-tag-form {
            @apply border border-primary-3;
        }
    }
}
</style>
