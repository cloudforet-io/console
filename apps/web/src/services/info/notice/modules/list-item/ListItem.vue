<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PBadge, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import NewMark from '@/common/components/marks/NewMark.vue';
import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { getPostBadgeInfo } from '@/services/info/notice/helper';
import type { NoticePostBadgeInfo, NoticePostModel } from '@/services/info/notice/type';

interface Props {
    inputText: string;
    isNew: boolean;
    postDirection: 'prev' | 'next' | undefined;
    post: NoticePostModel;
}

const props = withDefaults(defineProps<Props>(), {
    post: undefined,
    inputText: '',
    isNew: false,
    postDirection: undefined,
});
const store = useStore();
const { t } = useI18n();

const state = reactive({
    noticeTypeBadge: computed<NoticePostBadgeInfo>(() => getPostBadgeInfo(props.post?.post_type)),
    hasDomainRoleUser: computed<boolean>(() => store.getters['user/hasDomainRole']),
    hasSystemRoleUser: computed<boolean>(() => store.getters['user/hasSystemRole']),
    postDirectionLabel: computed(() => ((props.postDirection === 'prev') ? t('INFO.NOTICE.MAIN.PREV') : t('INFO.NOTICE.MAIN.NEXT'))),
    timezone: computed(() => store.state.user.timezone || 'UTC'),
    date: computed(() => dateFormatter(props.post?.created_at)),
    isPinned: computed(() => props.post?.options?.is_pinned),
    isPostExist: computed(() => props.post),
    postDirectionIcon: computed(() => ((props.postDirection === 'prev') ? 'ic_arrow-down' : 'ic_arrow-up')),
    domainName: '',
});

const dateFormatter = (date) => dayjs.tz(dayjs.utc(date), state.timezone).format('YYYY-MM-DD');

const getDomainName = async () => {
    if (!Object.keys(props.post ?? {}).length || !state.hasSystemRoleUser) return;
    if (!props.post.domain_id) {
        state.domainName = 'All Domains';
        return;
    }
    try {
        const { name } = await SpaceConnector.client.identity.domain.get({ domain_id: props.post.domain_id });
        state.domainName = name;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.domainName = '';
    }
};

(async () => {
    if (props.post && state.hasSystemRoleUser) await getDomainName();
})();

</script>

<template>
    <component :is="postDirection ? 'div' : 'li'"
               class="list-item"
               :class="{ 'pointer': !!post }"
    >
        <div v-if="postDirection"
             class="post-direction"
        >
            <span>{{ state.postDirectionLabel }}</span><p-i :name="state.postDirectionIcon"
                                                            width="1rem"
            />
        </div>
        <div v-if="state.isPostExist">
            <div class="title">
                <p-i v-if="state.isPinned"
                     class="pin"
                     name="ic_pin-filled"
                     width="1.125rem"
                />
                <text-highlighting class="title"
                                   :term="inputText"
                                   :text="post.title"
                />
                <new-mark v-if="isNew"
                          class="new-mark"
                />
            </div>
            <div class="info">
                <p-badge badge-type="solid-outline"
                         :style-type="state.noticeTypeBadge.style"
                >
                    {{ state.noticeTypeBadge.label }}
                </p-badge><span>{{ state.date }}</span><p-i width="0.125rem"
                                                            name="ic_dot"
                />
                <span>{{ post.writer }}</span><p-i v-if="state.hasDomainRoleUser || state.hasSystemRoleUser"
                                                   width="0.125rem"
                                                   name="ic_dot"
                />
                <span v-if="state.hasDomainRoleUser || state.hasSystemRoleUser"
                      class="view-count"
                ><p-i name="ic_eye"
                      width="1.125rem"
                /> {{ post.view_count }}</span>
                <span v-if="state.hasSystemRoleUser"
                      class="view-count"
                >| {{ state.domainName }}</span>
            </div>
        </div>
        <div v-else
             class="not-exist-item"
        >
            {{ t('INFO.NOTICE.MAIN.NO_NEXT_LIST') }}
        </div>
    </component>
</template>

<style scoped lang="postcss">
.list-item {
    @apply border-b border-gray-200 flex;
    padding: 1rem;

    &.pointer {
        @media (hover: hover) {
            &:hover {
                @apply bg-blue-100;
                cursor: pointer;
            }
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
        margin-left: 4.3125rem;
    }

    .post-direction {
        @apply flex items-center text-gray-700;
        font-size: 0.75rem;
        line-height: 1.25;
        padding: 1rem 1rem 1rem 0.5rem;
    }
}

.list-item:last-child {
    @apply border-b-0;
}
</style>
