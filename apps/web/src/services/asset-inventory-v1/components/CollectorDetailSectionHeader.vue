<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PHeading, PIconButton, screens, PHeadingLayout,
} from '@cloudforet/mirinae';

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
    <p-heading-layout class="pt-8 px-4 pb-4">
        <template #heading>
            <p-heading :title="props.title"
                       heading-type="sub"
                       :use-total-count="props.totalCount !== undefined"
                       :total-count="props.totalCount"
            />
        </template>
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
                           @click="handleClickEdit"
            />
        </template>
    </p-heading-layout>
</template>
