<template>
    <span class="pdf-download-button">
        <p-popover v-if="!isBrowserSupported"
                   class="popover"
                   position="bottom-end"
        >
            <p-icon-button v-if="iconOnly"
                           name="ic_download"
                           style-type="tertiary"
                           size="sm"
                           @click="$emit('click', $event)"
            />
            <p-button v-else
                      icon-left="ic_download"
                      style-type="tertiary"
                      @click="$emit('click', $event)"
            >
                {{ title }}
            </p-button>
            <template #content>
                <i18n class="popover-content"
                      path="COMMON.BUTTONS.PDF_DOWNLOAD_BUTTON.SUPPORT_PDF_HELP_TEXT"
                >
                    <template #desktop>
                        <span class="font-bold">{{ $t('COMMON.BUTTONS.PDF_DOWNLOAD_BUTTON.DESKTOP') }}</span>
                    </template>
                    <template #chrome>
                        <span class="font-bold">{{ $t('APP.MODAL.RECOMMEND_BROWSER.CHROME') }}</span>
                    </template>
                    <template #edge>
                        <span class="font-bold">{{ $t('APP.MODAL.RECOMMEND_BROWSER.EDGE') }}</span>
                    </template>
                </i18n>
            </template>
        </p-popover>
        <template v-if="isBrowserSupported">
            <p-icon-button v-if="iconOnly"
                           name="ic_download"
                           style-type="tertiary"
                           size="sm"
                           @click="$emit('click', $event)"
            />
            <p-button v-else
                      icon-left="ic_download"
                      style-type="tertiary"
                      @click="$emit('click', $event)"
            >
                {{ title }}
            </p-button>
        </template>
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PPopover, PIconButton, PButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { supportsBrowser } from '@/lib/helper/cross-browsing-helper';

interface Props {
    iconOnly?: boolean;
}
export default defineComponent<Props>({
    name: 'PdfDownloadButton',
    components: {
        PPopover: PPopover as any,
        PIconButton,
        PButton,
    },
    props: {
        iconOnly: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String as PropType<string|TranslateResult>,
            default: 'PDF',
        },
    },
    setup() {
        return {
            i18n,
            isBrowserSupported: supportsBrowser(),
        };
    },
});
</script>

<style lang="postcss" scoped>
.pdf-download-button {
    display: inline-flex;
}

/* custom design-system component - p-popover */
:deep(.popover) {
    .popper {
        z-index: 1;
    }
    .popover-content {
        @apply my-3 ml-2;
        width: 21.75rem;
        font-size: 0.875rem;
        line-height: 1.3125rem;
    }
}

/* custom design-system component - p-button */
:deep(.p-button) {
    padding: 0 1rem;
}

@screen mobile {
    /* custom design-system component - p-popover */
    :deep(.popover) {
        .popper {
            width: 17rem;
        }
    }
}
</style>
