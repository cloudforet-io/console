<script lang="ts" setup>

import { PFieldGroup } from '@spaceone/design-system';
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';

import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';


const emit = defineEmits<{(event: 'update:isTagsValid', value: boolean): void; }>();
const { t } = useI18n();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const props = defineProps<{
    serviceName: string;
}>();

const state = reactive({
    isTagsValid: true,
});

/* event */
const handleUpdateTags = (tags: Tag) => {
    collectorFormStore.setTags(tags);
};

watch(() => state.isTagsValid, (isTagsValid) => {
    emit('update:isTagsValid', isTagsValid);
}, { immediate: true });


</script>

<template>
    <p-field-group class="collector-tag-form"
                   :label="t('INVENTORY.COLLECTOR.CREATE.TAG')"
    >
        <template #label-extra>
            <div class="mt-1">
                <p class="tag-description">
                    {{ t("INVENTORY.COLLECTOR.CREATE.TAG_FORM_DESC1", {service: props.serviceName}) }}
                </p>
                <p class="tag-description">
                    {{ t("INVENTORY.COLLECTOR.CREATE.TAG_FORM_DESC2", {service: props.serviceName}) }}
                </p>
            </div>
        </template>
        <tags-input-group v-model:is-valid="state.isTagsValid"
                          :tags="collectorFormState.tags"
                          show-validation
                          @update-tags="handleUpdateTags"
        />
    </p-field-group>
</template>

<style lang="postcss" scoped>
.collector-tag-form {
    .tag-description {
        @apply text-label-md text-gray-900;
        font-weight: 400;
    }
}

</style>
