<script setup lang="ts">
import { reactive } from 'vue';

import {
    PTextarea, PButton, PTextBeautifier, PCollapsiblePanel,
} from '@cloudforet/mirinae';

const state = reactive({
    isEditMode: false,
    dataForUpdate: 'dataForUpdate',
});

const handleClickEditModeButton = (value: boolean) => {
    state.isEditMode = value;
};
const handleClickSaveButton = () => {
    console.log('TODO: handleClickSaveButton');
};
</script>

<template>
    <div class="alert-detail-info-table-description"
         :class="{ 'edit-mode': state.isEditMode }"
    >
        <div v-if="!state.isEditMode"
             class="content-wrapper"
        >
            <p-collapsible-panel :line-clamp="10"
                                 class="collapsible-panel"
            >
                <p-text-beautifier class="whitespace-pre-line"
                                   value="description"
                />&zwnj;
            </p-collapsible-panel>
            <p-button style-type="tertiary"
                      size="sm"
                      @click="handleClickEditModeButton(true)"
            >
                {{ $t('ALERT_MANAGER.EDIT') }}
            </p-button>
        </div>
        <div v-else
             class="content-wrapper"
        >
            <p-textarea v-model="state.dataForUpdate"
                        class="min-h-60"
            />
            <div class="buttons-wrapper flex ml-auto gap-2">
                <p-button style-type="secondary"
                          size="sm"
                          @click="handleClickEditModeButton(false)"
                >
                    {{ $t('ALERT_MANAGER.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          size="sm"
                          @click="handleClickSaveButton"
                >
                    {{ $t('ALERT_MANAGER.ALERTS.SAVE_CHANGES') }}
                </p-button>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.alert-detail-info-table-description {
    .content-wrapper {
        @apply inline-flex justify-between w-full items-start text-gray-900 text-paragraph-md;
        .collapsible-panel {
            @apply mr-2 p-0 leading-6;
        }
    }
    &.edit-mode {
        .content-wrapper {
            @apply flex-col gap-2;
        }
    }
}
</style>
