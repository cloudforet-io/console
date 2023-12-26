<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PI, PSkeleton } from '@spaceone/design-system';
import dayjs from 'dayjs';

import type { PostModel } from '@/schema/board/post/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import NewMark from '@/common/components/marks/NewMark.vue';
import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';


const props = withDefaults(defineProps<{
    inputText?: string;
    isNew?: boolean;
    postDirection?: 'prev' | 'next' | undefined;
    post?: PostModel;
    loading?: boolean;
}>(), {
    inputText: '',
    isNew: false,
    postDirection: undefined,
    post: undefined,
    loading: true,
});
const state = reactive({
    hasDomainRoleUser: computed<boolean>(() => store.getters['user/isDomainAdmin']),
    postDirectionLabel: computed<TranslateResult>(() => ((props.postDirection === 'prev') ? i18n.t('INFO.NOTICE.MAIN.PREV') : i18n.t('INFO.NOTICE.MAIN.NEXT'))),
    timezone: computed<string>(() => store.state.user.timezone || 'UTC'),
    date: computed<string>(() => dateFormatter(props.post?.created_at)),
    isPinned: computed<boolean>(() => !!props.post?.options?.is_pinned),
    postDirectionIcon: computed<string>(() => ((props.postDirection === 'prev') ? 'ic_arrow-down' : 'ic_arrow-up')),
    writer: computed<string>(() => {
        if (!props.post) return '';
        return props.post.writer;
    }),
});

const dateFormatter = (date?: string): string => {
    if (!date) return '';
    return dayjs.tz(dayjs.utc(date), state.timezone).format('YYYY-MM-DD');
};

</script>
<template>
    <component :is="props.postDirection ? 'div' : 'li'"
               class="notice-list-item"
               :class="{ 'pointer': !!props.post }"
    >
        <div v-if="props.postDirection"
             class="post-direction"
             :style="{visibility: props.loading || props.post ? 'visible' : 'hidden'}"
        >
            <span>{{ state.postDirectionLabel }}</span><p-i :name="state.postDirectionIcon"
                                                            width="1rem"
            />
        </div>
        <div v-if="props.loading">
            <div class="skeleton-wrapper">
                <p-skeleton loading
                            width="7rem"
                            height="1.5rem"
                />
                <p-skeleton loading
                            width="15rem"
                            height="1.125rem"
                />
            </div>
        </div>
        <div v-else-if="props.post">
            <div class="title-wrapper">
                <p-i v-if="state.isPinned"
                     class="pin"
                     name="ic_pin-filled"
                     width="1.125rem"
                />
                <text-highlighting class="title-text"
                                   :term="state.inputText"
                                   :text="props.post?.title"
                />
                <new-mark v-if="props.isNew"
                          class="new-mark"
                />
            </div>
            <div class="info">
                <span>{{ state.date }}</span>
                <template v-if="state.hasDomainRoleUser">
                    <p-i width="0.125rem"
                         name="ic_dot"
                    />
                    <span>{{ state.writer }}</span>
                    <p-i width="0.125rem"
                         name="ic_dot"
                    />
                    <span class="view-count"><p-i name="ic_eye"
                                                  width="1.125rem"
                    /> {{ props.post?.view_count ?? 0 }}</span>
                </template>
            </div>
        </div>
        <div v-else
             class="not-exist-item"
        >
            {{ $t('INFO.NOTICE.MAIN.NO_NEXT_LIST') }}
        </div>
    </component>
</template>

<style scoped lang="postcss">
.notice-list-item {
    @apply border-b border-gray-200 flex;
    padding: 1rem;
    align-items: center;

    &.pointer {
        @media (hover: hover) {
            &:hover {
                @apply bg-blue-100;
                cursor: pointer;
            }
        }
    }

    .title-wrapper {
        display: inline-flex;
        align-items: center;
        margin-bottom: 0.375rem;
        vertical-align: baseline;
        height: 1.5rem;
        .pin {
            margin-right: 0.125rem;
            margin-bottom: 0.1875rem;
        }
        .title-text {
            @apply text-gray-900 font-bold;
            line-height: 1.25;
        }
        .new-mark {
            display: inline-block;
            margin-top: 0.1875rem;
        }
    }
    .info {
        @apply flex flex-wrap gap-2 items-center text-gray-600;
        font-size: 0.875rem;
        line-height: 1.25;
        .view-count {
            @apply flex items-center;
            gap: 0.125rem;
        }
    }

    .not-exist-item {
        @apply text-gray-300;
        font-weight: 700;
        font-size: 0.875rem;
        padding: 0.8125rem 0;
        line-height: 1.25;
        text-align: left;
        width: 100%;
    }

    .post-direction {
        @apply flex items-center text-gray-700;
        font-size: 0.75rem;
        line-height: 1.25;
        padding: 1rem 1rem 1rem 0.5rem;
        min-width: 5rem;
        flex-shrink: 0;
    }

    .skeleton-wrapper {
        width: 100%;
        display: flex;
        gap: 0.65rem;
        flex-direction: column;
        height: 100%;
    }
}

.notice-list-item:last-child {
    @apply border-b-0;
}
</style>
