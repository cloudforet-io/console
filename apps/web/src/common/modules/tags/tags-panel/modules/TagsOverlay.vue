<script setup lang="ts">
import {
    reactive, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import isEmpty from 'lodash/isEmpty';

import PairsForm from '@/common/components/forms/pairs-form/PairsForm.vue';
import type { Tag } from '@/common/modules/tags/type';

const props = withDefaults(defineProps<{
    title?: TranslateResult;
    tags?: Tag;
    loading?: boolean;
}>(), {
    title: undefined,
    tags: () => ({}),
    loading: false,
});

const emit = defineEmits<{(e: 'confirm', tags: Tag): void;
    (e: 'close'): void;
}>();

const state = reactive({
    noItem: computed(() => isEmpty(props.tags)),
});
</script>

<template>
    <pairs-form :title="props.title ?? $t('COMMON.TAGS.TITLE')"
                :pairs="props.tags"
                :loading="props.loading"
                class="tags-overlay"
                @confirm="emit('confirm', $event)"
                @close="emit('close')"
    >
        <template #description>
            <div v-if="state.noItem"
                 class="comment"
            >
                <span class="highlight">{{ $t('COMMON.TAGS.NO_TAGS') }}</span><br>
                {{ $t('COMMON.TAGS.CLICK_TO_ADD_TAG') }}
            </div>
            <div v-else
                 class="comment"
            >
                <span class="font-bold">{{ $t('COMMON.TAGS.ADD_TAG_DESC') }}</span><br>
                {{ $t('COMMON.TAGS.KEY_VALUE_DESC') }}
            </div>
        </template>
    </pairs-form>
</template>

<style lang="postcss" scoped>
.tags-overlay {
    .comment {
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
        line-height: 150%;
    }
}
</style>
