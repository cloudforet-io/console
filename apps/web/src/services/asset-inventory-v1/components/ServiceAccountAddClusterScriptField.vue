<script setup lang="ts">

import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButton, PCodeEditor, PTextHighlighting } from '@cloudforet/mirinae';

import { copyAnyData } from '@/lib/helper/copy-helper';

interface Props {
    description?: string;
    highlightingtTerm?: string;
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
    isCopied: false,
});

/* Event */
const handleClickCopyButton = (script: any) => {
    if (state.isCopied) return;
    copyAnyData(script);
    setTimeout(() => {
        state.isCopied = true;
        setTimeout(() => {
            state.isCopied = false;
        }, 1500);
    }, 800);
};

</script>

<template>
    <div class="service-account-add-cluster-script-field">
        <div class="description-wrapper">
            <p-text-highlighting class="script-description"
                                 :text="props.description"
                                 :term="props.highlightingtTerm"
                                 style-type="secondary"
            />
            <p-button :class="{'copy-button': true, 'copied': state.isCopied}"
                      style-type="tertiary"
                      size="sm"
                      :icon-left="state.isCopied ? 'ic_check' :'ic_copy'"
                      @click="handleClickCopyButton(props.script)"
            >
                {{ state.isCopied ? $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.COPIED') : $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.COPY_CODE') }}
            </p-button>
        </div>
        <div class="script-wrapper"
             :style="{'height': props.scriptHeight}"
        >
            <p-code-editor read-only
                           :code="props.script"
                           :options="state.options"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-add-cluster-script-field {
    margin-bottom: 0.75rem;
    .description-wrapper {
        @apply flex justify-between items-end gap-2;
        margin-bottom: 0.625rem;
        .script-description {
            @apply text-paragraph-md text-gray-900;
            white-space: pre-line;
        }
        .copy-button {
            min-width: 6rem;

            &.copied {
                @apply bg-gray-200;
            }
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
