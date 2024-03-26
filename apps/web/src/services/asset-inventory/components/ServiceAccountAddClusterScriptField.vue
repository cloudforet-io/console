<script setup lang="ts">

import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButton, PTextEditor } from '@spaceone/design-system';

import { copyAnyData } from '@/lib/helper/copy-helper';

interface Props {
    description?: string;
    script?: string|TranslateResult;
    scriptHeight?: string;
}

const props = defineProps<Props>();

const state = reactive({
    options: {
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'shell',
        lineWrapping: false,
        theme: 'dracula',
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    },
});

/* Event */
const handleClickCopyButton = (script: any) => {
    copyAnyData(script);
};

</script>

<template>
    <div class="service-account-add-cluster-script-field">
        <div class="description-wrapper">
            <span class="script-description">
                {{ props.description }}
            </span>
            <p-button class="copy-button"
                      style-type="tertiary"
                      size="sm"
                      icon-left="ic_copy"
                      @click="handleClickCopyButton(props.script)"
            >
                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.COPY_CODE') }}
            </p-button>
        </div>
        <div class="script-wrapper"
             :style="{'height': props.scriptHeight}"
        >
            <p-text-editor read-only
                           :code="props.script"
                           :options="state.options"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-add-cluster-script-field {
    margin-bottom: 1.5rem;
    .description-wrapper {
        @apply flex justify-between items-end gap-2;
        margin-bottom: 0.625rem;
        .script-description {
            @apply text-paragraph-md text-gray-900;
            white-space: pre-line;
        }
        .copy-button {
            min-width: 6rem;
        }
    }
    .script-wrapper {
        @apply border border-gray-200;
        border-radius: 0.375rem;
        overflow: hidden;

        :deep(.p-text-editor) {
            .CodeMirror {
                @apply text-code-md;
            }
        }
    }
}
</style>
