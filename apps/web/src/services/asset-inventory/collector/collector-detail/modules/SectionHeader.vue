<script setup lang="ts">
import type { TranslateResult } from 'vue-i18n';

import { PButton, PHeading } from '@spaceone/design-system';

const props = defineProps<{
    title: TranslateResult;
    editMode?: boolean;
    hideEditButton?: boolean;
    totalCount?: number;
}>();

const emit = defineEmits<{(e: 'click-edit'): void;
}>();

const handleClickEdit = () => {
    emit('click-edit');
};
</script>

<template>
    <p-heading :title="props.title"
               heading-type="sub"
               :use-total-count="props.totalCount !== undefined"
               :total-count="props.totalCount"
    >
        <template #extra>
            <p-button v-if="!props.editMode || props.hideEditButton"
                      size="md"
                      icon-left="ic_edit"
                      style-type="secondary"
                      @click="handleClickEdit"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
            </p-button>
        </template>
    </p-heading>
</template>
