<script setup lang="ts">
import {
    reactive, ref, watch,
} from 'vue';

import { PFieldGroup, PTextButton, PTextInput } from '@spaceone/design-system';
import type { InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';

import type { Tags } from '@/schema/_common/model';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    tags: Tags;
    isEdit?: boolean;
    isFormVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tags: undefined,
    isEdit: false,
    isFormVisible: false,
});

const emit = defineEmits<{(e: 'update:tags', role: Tags): void,
}>();

const state = reactive({
    formVisible: false,
    proxyTags: useProxyValue('tags', props, emit),
});

/* Component */
const handleClickButton = () => {
    state.formVisible = true;
};
const getInputItemsFromTagKeys = (keys: Tags): InputItem[] => Object.keys(keys).map((key) => ({
    label: `${key}: ${props.tags[key]}`,
    name: `${key}: ${props.tags[key]}`,
}));
const selected = ref<InputItem[]>(getInputItemsFromTagKeys(props.tags));
const handleUpdateSelected = (items: InputItem[]) => {
    selected.value = items;
    const refinedTags = items.map((item) => {
        if (item.name.includes(':')) {
            const tags = item.name.split(':').map((tag) => tag.trim());
            return { [tags[0]]: tags[1] };
        }
        return { [item.name]: item.name };
    });

    state.proxyTags = Object.assign({}, ...refinedTags);
};

/* Watcher */
watch(() => props.isFormVisible, (value) => {
    if (value) state.formVisible = true;
}, { immediate: true });
</script>

<template>
    <div class="user-add-tag-wrapper">
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
                           class="input-form"
            >
                <p-text-input class="text-input"
                              multi-input
                              :selected="selected"
                              appearance-type="stack"
                              block
                              @update:selected="handleUpdateSelected"
                />
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
        @apply flex flex-col bg-white border border-primary-3 rounded-md;
        padding: 0.75rem;
        .input-form {
            margin-bottom: 0;
            .text-input {
                margin-top: 0.25rem;
            }
        }
    }
}
</style>
