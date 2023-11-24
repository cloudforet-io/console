<script setup lang="ts">
import { PI } from '@spaceone/design-system';

interface Props {
    email?: string
}

const props = withDefaults(defineProps<Props>(), {
    email: '',
});
</script>

<template>
    <div class="email-info-wrapper">
        <div class="sent-email-wrapper">
            <div class="contents-wrapper">
                <p>{{ $t('COMMON.MFA_MODAL.SENT_DESC') }}</p>
                <div class="email-wrapper">
                    <p-i name="ic_envelope-filled"
                         height="0.875rem"
                         width="0.875rem"
                         color="inherit"
                    />
                    <p class="email-text">
                        {{ props.email }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.email-info-wrapper {
    margin-bottom: 1rem;
    .sent-email-wrapper {
        @apply flex justify-between items-center bg-gray-100 rounded text-label-md text-gray-700;
        padding: 0.5rem;
        .contents-wrapper {
            @apply flex flex-col;
            .email-wrapper {
                @apply flex items-center font-bold;
                gap: 0.375rem;
            }
        }
    }
}
</style>
