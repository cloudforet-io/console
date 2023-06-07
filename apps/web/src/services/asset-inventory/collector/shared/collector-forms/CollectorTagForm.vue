<template>
    <p-field-group class="collector-tag-form"
                   :label="$t('INVENTORY.COLLECTOR.CREATE.TAG')"
    >
        <template #label-extra>
            <div class="mt-1">
                <p class="tag-description">
                    {{ $t("INVENTORY.COLLECTOR.CREATE.TAG_FORM_DESC1", {service: props.serviceName}) }}
                </p>
                <p class="tag-description">
                    {{ $t("INVENTORY.COLLECTOR.CREATE.TAG_FORM_DESC2", {service: props.serviceName}) }}
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

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';


const emit = defineEmits<{(event: 'update:isTagsValid', value: boolean): void; }>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const props = defineProps<{
    serviceName: string;
}>();

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
