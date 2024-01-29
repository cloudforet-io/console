<script setup lang="ts">
import { PLazyImg } from '@spaceone/design-system';

interface Props {
    title?: string;
    subTotal?: string;
    provider?: string;
    providerIconSrc?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    subTotal: '',
    provider: '',
    providerIconSrc: '',
});


</script>

<template>
    <div class="table-header">
        <div class="title">
            <p-lazy-img width="2rem"
                        height="2rem"
                        :src="props.providerIconSrc"
                        class="mr-1"
            />
            <span class="title-text">{{ props.title }}</span>
        </div>
        <div class="sub-total">
            <label class="sub-total-text">{{ $t('COMMON.COST_REPORT.SUBTOTAL') }}:</label>{{ props.subTotal }}
        </div>
    </div>
</template>

<style scoped lang="postcss">
.table-header {
    @apply flex justify-between;
    padding: 0.875rem 1rem 0.875rem 0.25rem;
    .title {
        @apply flex items-center;

        .title-text {
            @apply text-label-xl;
            margin-left: 1rem;
        }
    }

    .sub-total {
        @apply flex items-center text-label-lg;

        .sub-total-text {
            @apply text-gray-500;
            margin-right: 0.5rem;
        }
    }
}
</style>
