<script setup lang="ts">

import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PFieldGroup, PTextInput } from '@cloudforet/mirinae';
import type { InputItem } from '@cloudforet/mirinae/types/inputs/input/text-input/type';

import type { Tags } from '@/schema/_common/model';
import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import { getInputItemsFromTagKeys } from '@/services/iam/composables/tag-data';

const emit = defineEmits<{(e: 'update:tags', role: Tags): void,
}>();

const props = defineProps<{
    tags: Tags;
}>();

const validationState = reactive({
    isValid: true as undefined | boolean,
    invalidText: '' as TranslateResult | string,
});
const state = reactive({
    searchText: '',
    proxyTags: useProxyValue('tags', props, emit),
    selected: getInputItemsFromTagKeys(props.tags),
});
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
</script>

<template>
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
</template>

<style scoped lang="postcss">
.input-form {
    margin-bottom: 0;
    .text-input {
        margin-top: 0.25rem;
    }
}
</style>
