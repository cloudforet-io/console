<script lang="ts" setup>

import {
    PIconButton, PPaneLayout, PButton,
} from '@spaceone/design-system';
import { isEmpty } from 'lodash';
import {
    reactive, computed, onMounted,
} from 'vue';
import { useI18n } from 'vue-i18n';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';

interface Props {
    title: string | undefined;
    tags: Tag;
    loading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update', value: Tag): void;
    (e: 'close'): void;
}>();
const { t } = useI18n();

const state = reactive({
    showHeader: computed(() => state.newTags.length > 0),
    newTags: { ...props.tags },
    isTagsValid: false,
    noItem: computed(() => isEmpty(state.newTags)),
});

/* Api */
const handleSaveTags = async () => {
    if (!state.isTagsValid) return;
    emit('update', state.newTags);
};

/* Event */
const handleUpdateTags = (tags?: Tag) => {
    state.newTags = tags;
};
const handleClickClose = () => {
    emit('close');
};

/* Init */
onMounted(() => {
    state.newTags = { ...props.tags };
});

</script>

<template>
    <div class="tags-overlay">
        <p-pane-layout class="page-wrapper">
            <div class="page-nav">
                <div class="left">
                    <p-icon-button name="ic_arrow-left"
                                   size="lg"
                                   class="go-back-button mr-2"
                                   @click="handleClickClose"
                    />
                    <div class="title">
                        {{ title ?? t('COMMON.TAGS.TITLE') }}
                    </div>
                </div>
                <div class="right" />
            </div>
            <p-pane-layout class="tag-panel">
                <div v-if="state.noItem"
                     class="comment"
                >
                    <span class="highlight">{{ t('COMMON.TAGS.NO_TAGS') }}</span><br>
                    {{ t('COMMON.TAGS.CLICK_TO_ADD_TAG') }}
                </div>
                <div v-else
                     class="comment"
                >
                    <span class="highlight">{{ t('COMMON.TAGS.ADD_TAG_DESC') }}</span><br>
                    {{ t('COMMON.TAGS.KEY_VALUE_DESC') }}
                </div>
                <tags-input-group v-model:is-valid="visTagsValid"
                                  :tags="state.newTags"
                                  :disabled="loading"
                                  show-validation
                                  :show-header="state.showHeader"
                                  @update-tags="handleUpdateTags"
                />
            </p-pane-layout>
            <div class="buttons">
                <p-button style-type="tertiary"
                          @click="handleClickClose"
                >
                    {{ t('COMMON.TAGS.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :disabled="!state.isTagsValid"
                          @click="handleSaveTags"
                >
                    {{ t('COMMON.TAGS.SAVE') }}
                </p-button>
            </div>
        </p-pane-layout>
    </div>
</template>

<style lang="postcss" scoped>
.tags-overlay {
    position: fixed;
    width: 100vw;
    height: calc(100vh - $(gnb-height));
    top: $gnb-height;
    left: 0;
    z-index: 99;
    background-color: $bg-color;

    .page-wrapper {
        display: flex;
        flex-direction: column;
        background-color: transparent;
        width: 100%;
        max-height: 100%;
        min-height: 100%;
        border: none;
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
        .comment {
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
            line-height: 150%;
            .highlight {
                font-weight: bold;
            }
        }
        .tag-panel {
            @apply pl-4 pr-6 m-6;
            flex-grow: 1;
            overflow-y: auto;
        }
        .buttons {
            @apply flex mb-8 pr-6 justify-end;
            .p-button {
                @apply ml-4;
            }
        }
    }
    .fnb {
        @apply flex-grow-0 border-none bg-white;
    }
}
</style>
