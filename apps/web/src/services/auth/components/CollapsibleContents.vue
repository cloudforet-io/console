<script setup lang="ts">
import { PTextButton, PDataLoader } from '@spaceone/design-system';

interface Props {
    loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const emit = defineEmits<{(e: 'click-resend'): void;
}>();

/* API */
const handleClickResend = async () => {
    emit('click-resend');
};
</script>

<template>
    <p-data-loader class="collapsible-contents-wrapper"
                   :loading="props.loading"
    >
        <div class="contents-item">
            <p class="title">
                {{ $t('AUTH.COLLAPSED.EXTENSION_TITLE_1') }}
            </p>
            <ul class="list">
                <li>{{ $t('AUTH.COLLAPSED.EXTENSION_REASON_1') }}</li>
                <li>{{ $t('AUTH.COLLAPSED.EXTENSION_REASON_2') }}</li>
                <li>
                    <p-text-button class="re-send-button"
                                   @click="handleClickResend"
                    >
                        {{ $t('AUTH.COLLAPSED.CLICK_HERE') }}
                    </p-text-button>
                    {{ $t('AUTH.COLLAPSED.EXTENSION_REASON_3') }}
                </li>
            </ul>
        </div>
        <div class="contents-item">
            <p class="title">
                {{ $t('AUTH.COLLAPSED.EXTENSION_TITLE_2') }}
            </p>
            <p>
                {{ $t('AUTH.COLLAPSED.EXTENSION_DESC_1') }}
                <span class="contact-help-text">
                    {{ $t('AUTH.COLLAPSED.EXTENSION_CONTACT') }}
                </span>
            </p>
        </div>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.collapsible-contents-wrapper {
    @apply text-paragraph-sm;
    max-width: 23rem;
    .contents-item {
        .title {
            @apply font-bold;
        }
        .contact-help-text {
            @apply text-violet-600;
        }
        li {
            @apply relative;
            padding-left: 1.25rem;
            &::before {
                @apply absolute;
                content: '·';
                top: 0;
                left: 0.5rem;
            }
            .re-send-button {
                @apply inline-block text-paragraph-sm text-blue-700;
                padding: 0;
            }
        }
        & + .contents-item {
            margin-top: 1.625rem;
        }
        a {
            @apply text-blue-700;
        }
    }
}
</style>
