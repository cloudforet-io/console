<template>
    <div class="collector-base-info-edit">
        <!-- TODO: Add form fields -->
        <p-button style-type="tertiary"
                  size="lg"
                  @click="handleClickCancel"
        >
            {{ $t('INVENTORY.COLLECTOR.DETAIL.CANCEL') }}
        </p-button>
        <p-button style-type="primary"
                  size="lg"
                  class="save-changes-button"
                  @click="handleClickSave"
        >
            {{ $t('INVENTORY.COLLECTOR.DETAIL.SAVE_CHANGES') }}
        </p-button>
    </div>
</template>

<script lang="ts" setup>
import { defineEmits } from 'vue';

import { PButton } from '@spaceone/design-system';

const emit = defineEmits<{(event: 'cancel'): void;
    (event: 'save'): void;
}>();

const handleClickCancel = () => {
    emit('cancel');
};
const handleClickSave = () => {
    emit('save');
};
</script>

<style lang="postcss" scoped>
.collector-base-info-edit {
    padding: 1rem;
    .save-changes-button {
        margin-left: 1rem;
    }
}
</style>
