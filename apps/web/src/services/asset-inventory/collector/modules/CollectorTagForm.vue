<template>
    <!--            TODO: translation-->
    <p-field-group class="collector-tag-form"
                   :label="$t('Tag')"
    >
        <template #label-extra>
            <div class="mt-1">
                <!-- TODO: translation -->
                <p class="tag-description">
                    {{ $t("Set Account's tag.") }}
                </p>
                <p class="tag-description">
                    {{ $t("The Key - Value pair is a required field. Only underscores (_), characters, and numbers are allowed. International characters are allowed.") }}
                </p>
            </div>
        </template>
        <tags-input-group :tags="state.tags"
                          show-validation
                          :is-valid.sync="state.isTagsValid"
                          @update-tags="handleUpdateTags"
        />
    </p-field-group>
</template>

<script lang="ts" setup>

import { reactive, watch } from 'vue';

import { PFieldGroup } from '@spaceone/design-system';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';

import { useCollectorFormStore } from '@/services/asset-inventory/store/collector-form-store';


const emit = defineEmits<{(event: 'update:isTagsValid', value: boolean): void; }>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const state = reactive({
    tags: collectorFormState.tags as Tag,
    isTagsValid: true,
});

/* event */
const handleUpdateTags = (tags: Tag) => {
    state.tags = tags;
    collectorFormStore.setTags(tags);
};

watch(() => state.isTagsValid, (isTagsValid) => {
    emit('update:isTagsValid', isTagsValid);
}, { immediate: true });


</script>

<style lang="postcss" scoped>
.collector-tag-form {
    .tag-description {
        @apply text-label-md text-gray-900;
        font-weight: 400;
    }
}

</style>
