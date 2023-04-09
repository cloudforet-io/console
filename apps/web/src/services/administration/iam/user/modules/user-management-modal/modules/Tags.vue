<template>
    <div class="tags-wrapper">
        <p-field-group :label="$t('IDENTITY.USER.FORM.TAGS')"
                       class="title"
        >
            <div class="tag-help-msg">
                {{ $t('IDENTITY.USER.FORM.TAGS_HELP_TEXT1') }} <br>
                {{ $t('IDENTITY.USER.FORM.TAGS_HELP_TEXT2') }}
            </div>
        </p-field-group>

        <tags-input-group :tags="formState.tags"
                          show-validation
                          :is-valid.sync="validationState.isTagsValid"
                          is-administration
                          class="utils-wrapper"
                          @update-tags="handleUpdateTags"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { PFieldGroup } from '@spaceone/design-system';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const formState = reactive({
    tags: {},
});
const validationState = reactive({
    isTagsValid: undefined as undefined | boolean,
});

const handleUpdateTags = (tags: Tag) => {
    formState.tags = tags;
    emit('change-input', formState);
};
</script>

<style lang="postcss" scoped>
.tags-wrapper {
    .title {
        margin-bottom: 0;
    }
    .utils-wrapper {
        .p-button {
            margin-top: 0;
            margin-bottom: 0.75rem;
        }
    }
    .tag-help-msg {
        font-size: 0.875rem;
        line-height: 150%;
    }
}
</style>
