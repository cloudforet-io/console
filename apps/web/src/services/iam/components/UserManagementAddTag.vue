<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import { PTextButton } from '@cloudforet/mirinae';

import type { Tags } from '@/schema/_common/model';

import TagsInput from '@/common/components/inputs/TagsInput.vue';

interface Props {
    tags: Tags;
    isBordered?: boolean;
    isFormVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tags: undefined,
    isBordered: false,
    isFormVisible: false,
});

const emit = defineEmits<{(e: 'update:tags', role: Tags): void,
}>();

const state = reactive({
    formVisible: false,
});

const handleUpdateTags = (tags: Tags) => {
    emit('update:tags', tags);
};

/* Component */
const handleClickButton = () => {
    state.formVisible = true;
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
            <tags-input :tags="props.tags"
                        @update:tags="handleUpdateTags"
            />
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
