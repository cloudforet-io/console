<template>
    <section class="notice-detail-page">
        <p-page-title :title="noticePostData.title"
                      child
                      @goBack="$router.go(-1)"
        >
            <template #extra>
                <div v-if="hasDomainRoleUser" class="button-group">
                    <p-button :outline="true" style-type="gray-border" icon="ic_edit">
                        {{ $t('Edit') }}
                    </p-button>
                    <p-button :outline="true" style-type="gray-border" icon="ic_send">
                        {{ $t('Send Email') }}
                    </p-button>
                    <p-button :outline="true" style-type="alert">
                        {{ $t('Delete') }}
                    </p-button>
                </div>
            </template>
        </p-page-title>
        <p-pane-layout class="notice-detail-page-layout">
            <p-data-loader :loading="loading" :data="noticePostData">
                <div class="post-title">
                    <p-badge outline :style-type="noticeTypeBadgeInfo.style">
                        {{ noticeTypeBadgeInfo.label }}
                    </p-badge>
                    <span>{{ noticePostData.created_at }}
                    </span><p-i width="0.125rem" name="ic_divider-dot" />
                    <span> {{ noticePostData.writer }}</span>
                    <p-i v-if="hasDomainRoleUser" width="0.125rem" name="ic_divider-dot" />
                    <span v-if="hasDomainRoleUser" class="view-count"><p-i name="ic_view" width="1.125rem" /> 1,234</span>
                </div>
                <p-divider />
                <text-editor-viewer :contents="contents" />
            </p-data-loader>
        </p-pane-layout>
        <p-pane-layout class="post-router">
            <div class="post-router-item">
                <list-item class="" :title="nextNoticePost.title"
                           post-direction="next"
                           :notice-type="nextNoticePost.scope"
                           :is-pinned="nextNoticePost.options.is_pinned"
                />
            </div>
            <p-divider />
            <div class="post-router-item">
                <list-item class="" :title="nextNoticePost.title"
                           post-direction="prev"
                           :notice-type="nextNoticePost.scope"
                           :is-pinned="nextNoticePost.options.is_pinned"
                />
            </div>
        </p-pane-layout>
        <section class="back-to-list-button-section">
            <p-button class="back-to-list-button" :outline="true"
                      style-type="gray-border"
                      @click="handleBackToListButtonClick"
            >
                <!-- song-lang-->
                {{ $t('Back to List') }}
            </p-button>
        </section>
    </section>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import {
    PBadge, PButton, PDataLoader, PDivider, PI, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import type { TranslateResult } from 'vue-i18n';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';

import { getPostBadgeInfo } from '@/services/my-page/notice/helper';
import ListItem from '@/services/my-page/notice/modules/list-item/ListItem.vue';
import type { NoticePostModel } from '@/services/my-page/notice/type';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';


export default {
    name: 'NoticeDetailPage',
    components: {
        TextEditorViewer,
        PPaneLayout,
        PDataLoader,
        PBadge,
        PI,
        PDivider,
        PPageTitle,
        PButton,
        ListItem,
    },
    setup() {
        const state = reactive({
            loading: false,
            noticePostData: {
                board_id: 'board-14a09a71f504',
                post_id: 'post-d4e6373b3c3f',
                category: '',
                title: '[작업 공지] 시스템 안정화를 위해 작업을 진행합니다.',
                contents: '',
                options: {
                    is_popup: true,
                    is_pinned: true,
                },
                view_count: 1,
                writer: 'sulmo',
                scope: 'DOMAIN',
                domain_id: '',
                user_id: '',
                user_domain_id: '',
                created_at: '2022-08-05T10:53:04.918Z',
                updated_at: '2022-08-05T10:53:04.918Z',
            } as NoticePostModel|unknown,
            prevNoticePost: {
                board_id: 'board-14a09a71f504',
                post_id: 'post-d4e6373b3c3f',
                title: '[작업 공지] 시스템 안정화를 위해 작업을 진행합니다.',
                contents: '',
                view_count: 1,
                writer: 'sulmo',
                scope: 'DOMAIN',
                created_at: '2022-08-05T10:53:04.918Z',
                updated_at: '2022-08-05T10:53:04.918Z',
                options: {
                    is_pinned: true,
                },
            },
            nextNoticePost: {
                board_id: 'board-14a09a71f504',
                post_id: 'post-d4e6373b3c3f',
                title: '[작업 공지] 시스템 안정화를 위해 작업을 진행합니다.',
                contents: '',
                view_count: 1,
                writer: 'sulmo',
                scope: 'DOMAIN',
                created_at: '2022-08-05T10:53:04.918Z',
                updated_at: '2022-08-05T10:53:04.918Z',
                options: {
                    is_pinned: true,
                },
            },
            hasDomainRoleUser: computed(() => store.getters['user/hasDomainRole']),
            noticeTypeBadgeInfo: computed<{ label?: TranslateResult; style?: string }>(() => getPostBadgeInfo(state.noticePostData?.scope)),
            // eslint-disable-next-line max-len
            contents: '<p>normal text</p><h1>h1</h1><h2>h2</h2><h3>h3</h3><p style="text-align: center">align center</p><p style="text-align: right">align right</p><p style="text-align: justify">align justify</p><p style="text-align: justify">color1 <span style="color: #7D5DD2">color2</span> <span style="color: #49A7F7">color3</span> ...</p><p style="text-align: justify"><strong>bold </strong></p><p style="text-align: justify"><em>italic</em></p><p style="text-align: justify"><u>underline</u></p><p style="text-align: justify"><s>strike</s></p><p style="text-align: justify"><code class="inline-code">this is inline code</code></p><ul><li><p style="text-align: justify">bullet</p><ul><li><p style="text-align: justify">bullet2</p><ul><li><p style="text-align: justify">bullet3</p></li></ul></li></ul></li><li><p style="text-align: justify">bullet4</p></li></ul><ol><li><p style="text-align: justify">number</p><ol><li><p style="text-align: justify">number1</p><ol><li><p style="text-align: justify">number2</p></li></ol></li></ol></li><li><p style="text-align: justify">number3</p><ol><li><p style="text-align: justify">number4</p></li></ol></li></ol><p style="text-align: justify"><a target="_blank" rel="noopener noreferrer nofollow" href="http://www.google.com">http://www.google.com</a></p><p style="text-align: justify"><img src="https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/spaceone.svg"></p><pre><code>const a = \'This is Code Block!\'nconsole.log(a)</code></pre><blockquote><p>This is Quote Block!</p></blockquote><hr><p></p><p>Good bye...!</p>',
        });

        const getNoticePostData = async () => {};

        const handleBackToListButtonClick = () => {
            SpaceRouter.router.push({ name: MY_PAGE_ROUTE.INFO.NOTICE._NAME });
        };

        (async () => {
            state.loading = true;
            await getNoticePostData();
            state.loading = false;
        })();
        return {
            ...toRefs(state),
            handleBackToListButtonClick,
        };
    },
};
</script>
<style scoped lang="postcss">
.button-group {
    @apply flex flex-wrap gap-2;
}

.notice-detail-page-layout {
    padding: 1.25rem 1.5rem;

    .post-title {
        @apply flex flex-wrap gap-2 items-center text-gray-600;
        font-size: 0.875rem;
        line-height: 1.25;
        margin-bottom: 1rem;
        .view-count {
            @apply flex items-center;
            gap: 0.125rem;
        }
    }
}

.post-router {
    margin-top: 1.5rem;
    .post-router-item {
        margin: 0.5rem 0;
    }
}

.back-to-list-button-section {
    text-align: center;
    margin-top: 1.5rem;
    .back-to-list-button {
        width: 10.9375rem;
    }
}
</style>
