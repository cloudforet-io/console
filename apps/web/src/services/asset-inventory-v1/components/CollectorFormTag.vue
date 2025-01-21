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
        <pairs-input-group :pairs="collectorFormState.tags"
                           show-validation
                           :is-valid.sync="state.isTagsValid"
                           @update-pairs="handleUpdateTags"
        />
    </p-field-group>
</template>

<script lang="ts" setup>

import { reactive, watch } from 'vue';

import { PFieldGroup } from '@cloudforet/mirinae';

import PairsInputGroup from '@/common/components/forms/pairs-input-group/PairsInputGroup.vue';
import type { Tag } from '@/common/modules/tags/type';

import { useCollectorFormStore } from '@/services/asset-inventory-v1/stores/collector-form-store';


const emit = defineEmits<{(event: 'update-valid', value: boolean): void; }>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.state;

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
    emit('update-valid', isTagsValid);
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
