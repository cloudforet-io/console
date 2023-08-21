<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PHeading, PIconButton, screens,
} from '@spaceone/design-system';

const props = defineProps<{
    title: TranslateResult;
    editMode?: boolean;
    hideEditButton?: boolean;
    totalCount?: number;
}>();

const emit = defineEmits<{(e: 'click-edit'): void;
}>();

const { width } = useWindowSize();

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
        <template v-if="!props.editMode && !props.hideEditButton"
                  #extra
        >
            <p-button v-if="width > screens.mobile.max"
                      size="md"
                      icon-left="ic_edit"
                      style-type="secondary"
                      @click="handleClickEdit"
            >
                {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
            </p-button>
            <p-icon-button v-else
                           name="ic_edit"
                           style-type="tertiary"
                           size="md"
                           shape="square"
            />
        </template>
    </p-heading>
</template>
