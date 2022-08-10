<template>
    <component :is="postDirection ? 'div' : 'li'" class="list-item">
        <!-- song-lang -->
        <div v-if="postDirection" class="post-direction">
            <span>{{ postDirectionLabel }}</span><p-i name="ic_arrow-top-alt" width="1rem" />
        </div>
        <div v-if="isPostExist">
            <div class="title">
                <p-i v-if="isPinned" class="pin" name="ic_pin"
                     width="1.125rem"
                />
                <text-highlighting class="title" :term="inputText" :text="post.title" />
                <new-mark v-if="isNew" class="new-mark" />
            </div>
            <div class="info">
                <p-badge outline :style-type="noticeTypeBadge.style">
                    {{ noticeTypeBadge.label }}
                </p-badge><span>{{ date }}</span><p-i width="0.125rem" name="ic_divider-dot" />
                <span>{{ post.writer }}</span><p-i v-if="hasDomainRoleUser" width="0.125rem" name="ic_divider-dot" />
                <span v-if="hasDomainRoleUser" class="view-count"><p-i name="ic_view" width="1.125rem" /> {{ post.view_count }}</span>
            </div>
        </div>
        <div v-else class="not-exist-item">
            <!-- song-lang -->
            {{ $t('다음 게시물이 없습니다. Next notice does not exist.') }}
        </div>
    </component>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import { PBadge, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';
import type { TranslateResult } from 'vue-i18n';

import { store } from '@/store';
import { i18n } from '@/translations';

import NewMark from '@/common/components/marks/NewMark.vue';
import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';

import type { NoticeType } from '@/services/info/notice/config';
import { getPostBadgeInfo } from '@/services/info/notice/helper';
import type { NoticePostModel } from '@/services/info/notice/type';


interface Props {
    noticeType: string;
    inputText: string;
    isNew: boolean;
    isPinned: boolean;
    postDirection: 'prev' | 'next' | undefined;
    post: NoticePostModel;
}

export default defineComponent<Props>({
    name: 'ListItem',
    components: {
        PBadge,
        PI,
        NewMark,
        TextHighlighting,
    },
    props: {
        post: {
            type: Object as PropType<NoticePostModel>,
            default: () => ({}),
        },
        noticeType: {
            type: String as PropType<NoticeType>,
            default: '',
        },
        inputText: {
            type: String,
            default: '',
        },
        isNew: {
            type: Boolean,
            default: false,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        isPostExist: {
            type: Boolean,
            default: true,
        },
        postDirection: {
            type: String as PropType<'prev' | 'next' | undefined>,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            noticeTypeBadge: computed<{ label?: TranslateResult; style?: string }>(() => getPostBadgeInfo(props.noticeType)),
            hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
            // song-lang
            postDirectionLabel: computed(() => ((props.postDirection === 'prev') ? i18n.t('Prev') : i18n.t('Next'))),
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            date: computed(() => dateFormatter(props.post?.created_at)),
        });

        const dateFormatter = date => dayjs.tz(dayjs.utc(date), state.timezone).format('YYYY-MM-DD');
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style scoped lang="postcss">
.list-item {
    @apply border-b border-gray-200 flex;
    padding: 1rem;

    @media (hover: hover) {
        &:hover {
            @apply bg-blue-100;
            cursor: pointer;
        }
    }

    .title {
        margin-bottom: 0.375rem;
        vertical-align: baseline;
        .pin {
            margin-right: 0.125rem;
            margin-bottom: 0.1875rem;
        }
        .title {
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
    }

    .post-direction {
        @apply flex items-center text-gray-700;
        font-size: 0.75rem;
        line-height: 1.25;
        padding: 1rem;
    }
}

.list-item:last-child {
    @apply border-b-0;
}
</style>
