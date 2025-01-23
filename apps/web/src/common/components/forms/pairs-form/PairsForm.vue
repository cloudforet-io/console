<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButton, PIconButton, PPaneLayout } from '@cloudforet/mirinae';

import PairsInputGroup from '@/common/components/forms/pairs-input-group/PairsInputGroup.vue';
import type {
    Pair, PairConfig, I18nLabels,
} from '@/common/components/forms/pairs-input-group/type';

const props = withDefaults(defineProps<{
    title?: TranslateResult;
    pairs?: Pair;
    loading?: boolean;
    pairConfig?: PairConfig;
    i18nLabels?: I18nLabels;
    isLongValue?: boolean;
}>(), {
    title: undefined,
    pairs: () => ({}),
    loading: false,
    pairConfig: undefined,
    i18nLabels: undefined,
    isLongValue: false,
});

const emit = defineEmits<{(e: 'confirm', pairs: Pair): void;
    (e: 'close'): void;
}>();

const state = reactive({
    showHeader: computed(() => Object.keys(state.newPairs).length > 0),
    newPairs: {},
    isPairsValid: false,
});

const handleCloseOverlay = () => {
    emit('close');
};
const handleSaveTags = async () => {
    if (!state.isPairsValid) return;
    emit('confirm', state.newPairs);
};

const handleUpdateTags = (tags?: Pair) => {
    state.newPairs = tags;
};

onMounted(() => {
    state.newPairs = { ...props.pairs };
});
</script>

<template>
    <div class="pair-overlay-wrapper">
        <p-pane-layout class="page-wrapper">
            <div class="page-nav">
                <div class="left">
                    <p-icon-button name="ic_arrow-left"
                                   size="lg"
                                   class="go-back-button mr-2"
                                   @click="handleCloseOverlay"
                    />
                    <div class="title">
                        {{ props.title }}
                    </div>
                </div>
                <div class="right" />
            </div>
            <p-pane-layout class="pair-panel">
                <slot name="description" />
                <pairs-input-group :pairs="state.newPairs"
                                   :disabled="props.loading"
                                   show-validation
                                   :is-long-value="props.isLongValue"
                                   :is-valid.sync="state.isPairsValid"
                                   :show-header="state.showHeader"
                                   :i18n-labels="props.i18nLabels"
                                   :pair-config="props.pairConfig"
                                   @update-pairs="handleUpdateTags"
                />
            </p-pane-layout>
            <div class="buttons">
                <p-button style-type="tertiary"
                          @click="handleCloseOverlay"
                >
                    {{ $t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :disabled="!state.isPairsValid"
                          @click="handleSaveTags"
                >
                    {{ $t('COMMON.TAGS.SAVE') }}
                </p-button>
            </div>
        </p-pane-layout>
    </div>
</template>

<style scoped lang="postcss">
.pair-overlay-wrapper {
    @apply fixed;
    width: 100vw;
    height: calc(100vh - $(top-bar-height));
    top: $top-bar-height;
    left: 0;
    z-index: 1030;
    background-color: $bg-color;

    .page-wrapper {
        @apply flex flex-col bg-transparent w-full border-none;
        max-width: 1920px;
        max-height: 100%;
        min-height: 100%;
        .page-nav {
            @apply mt-6 ml-8;
            flex-shrink: 0;
            .left {
                @apply flex;
                .go-back-button {
                    min-width: 2rem;
                    min-height: 2rem;
                    max-width: 2rem;
                    max-height: 2rem;
                }
                .title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    line-height: 1.2;
                }
            }
        }
        .pair-panel {
            @apply pl-4 pr-6 m-6;
            flex-grow: 1;
            overflow-y: auto;
        }
        .buttons {
            @apply flex mb-8 pr-6 justify-end gap-4;
        }
    }
}
</style>
