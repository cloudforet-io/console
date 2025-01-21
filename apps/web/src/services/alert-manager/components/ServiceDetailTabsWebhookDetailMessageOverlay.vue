<script setup lang="ts">
import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import PairsForm from '@/common/components/forms/pairs-form/PairsForm.vue';
import type { Pair } from '@/common/components/forms/pairs-input-group/type';

const props = withDefaults(defineProps<{
    formats?: Pair;
    loading?: boolean;
}>(), {
    formats: () => ({}),
    loading: false,
});

const emit = defineEmits<{(e: 'confirm', tags: Pair): void;
    (e: 'close'): void;
}>();

const state = reactive({
    i18nLabels: computed(() => ({
        INVALID_DUPLICATE_KEY: i18n.t('ALERT_MANAGER.WEBHOOK.MESSAGE_FORMAT_INVALID_DUPLICATED'),
        INVALID_KEY: i18n.t('ALERT_MANAGER.WEBHOOK.MESSAGE_FORMAT_INVALID_INPUT'),
        INVALID_VALUE: i18n.t('ALERT_MANAGER.WEBHOOK.MESSAGE_FORMAT_INVALID_INPUT'),
        ADD_PAIR_BUTTON: i18n.t('ALERT_MANAGER.WEBHOOK.MESSAGE_FORMAT_ADD_BUTTON'),
        KEY_LABEL: 'From',
        VALUE_LABEL: 'To',
    })),
});
</script>

<template>
    <pairs-form :title="$t('ALERT_MANAGER.WEBHOOK.MSG_FORMAT')"
                :pairs="props.formats"
                :loading="props.loading"
                :pair-config="{ keyLabel: 'from', valueLabel: 'to' }"
                :i18n-labels="state.i18nLabels"
                class="service-detail-tabs-webhook-detail-message-overlay"
                @confirm="emit('confirm', $event)"
                @close="emit('close')"
    >
        <template #description>
            <div class="comment">
                <span class="font-bold">{{ $t('ALERT_MANAGER.WEBHOOK.MESSAGE_FORMAT_DESC') }}</span><br>
                {{ $t('ALERT_MANAGER.WEBHOOK.MESSAGE_FORMAT_VALUE_DESC') }}
            </div>
        </template>
    </pairs-form>
</template>

<style lang="postcss" scoped>
.service-detail-tabs-webhook-detail-message-overlay {
    .comment {
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
        line-height: 150%;
    }
}
</style>
