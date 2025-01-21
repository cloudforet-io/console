<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButton, PIconButton, PPaneLayout } from '@cloudforet/mirinae';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';

const props = withDefaults(defineProps<{
    title?: TranslateResult;
    pairs?: Record<string, any>;
    loading?: boolean;
}>(), {
    title: undefined,
    pairs: () => ({}),
    loading: false,
});

const emit = defineEmits<{(e: 'save', pairs: Record<string, any>): void;
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
    emit('save', state.newPairs);
};

const handleUpdateTags = (tags?: Tag) => {
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
                <tags-input-group :tags="state.newPairs"
                                  :disabled="props.loading"
                                  show-validation
                                  :is-valid.sync="state.isPairsValid"
                                  :show-header="state.showHeader"
                                  @update-tags="handleUpdateTags"
                />
            </p-pane-layout>
            <div class="buttons">
                <p-button style-type="tertiary"
                          @click="$emit('close')"
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
            @apply flex mb-8 pr-6 justify-end;
        }
    }
}
</style>
