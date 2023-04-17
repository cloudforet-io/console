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

import type { User } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    item?: User;
}

const props = withDefaults(defineProps<Props>(), {
    item: undefined,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const formState = reactive({
    tags: {},
});
const validationState = reactive({
    isTagsValid: undefined as undefined | boolean,
});

/* Components */
const setForm = () => {
    formState.tags = props.item.tags || {};
};
const handleUpdateTags = (tags: Tag) => {
    formState.tags = tags;
    emit('change-input', { ...formState, tags: formState.tags });
};

/* Init */
(async () => {
    if (userPageState.visibleUpdateModal) {
        await setForm();
    }
})();
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
