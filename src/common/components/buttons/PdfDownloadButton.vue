<template>
    <p-popover class="popover" position="bottom-end">
        <slot />
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
</template>

<script lang="ts">
import { PPopover } from '@spaceone/design-system';
import { i18n } from '@/translations';

export default {
    name: 'PdfDownloadButton',
    components: {
        PPopover,
    },
    setup() {
        return {
            i18n,
        };
    },
};
</script>

<style lang="postcss" scoped>
.popover::v-deep {
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

@screen mobile {
    .popover::v-deep {
        .popper {
            width: 17rem;
        }
    }
}
</style>
