<template>
    <p-button-modal :visible="popupVisible"
                    :backdrop="false"
                    hide-header
                    hide-header-close-button
                    hide-footer-close-button
                    size="sm"
                    :absolute="popupIndex * 1.5 + (isMobile() ? 0.75 : 7.5)"
                    class="notice-popup"
                    @confirm="handleClose"
    >
        <template #body>
            <h1 class="notice-popup-title">
                {{ noticeItem.notice_title }}
            </h1>
            <div class="notice-popup-info">
                <p-badge outline>
                    {{ noticeItem.notice_type }}
                </p-badge>
                <span class="notice-popup-author">{{ noticeItem.created_at }} · {{ noticeItem.author_type }}</span>
            </div>
            <p-divider class="my-4" />
            <p class="notice-popup-contents">
                {{ noticeItem.contents }}
            </p>
        </template>
        <template #footer-extra>
            <p-check-box v-model="isDontShowChecked">
                <!--            song-lang-->
                Don't show me again
            </p-check-box>
        </template>
        <template #confirm-button>
            <!--            song-lang-->
            <span>Close</span>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PButtonModal, PCheckBox, PBadge, PDivider,
} from '@spaceone/design-system';


import { store } from '@/store';

import { isMobile } from '@/lib/helper/cross-browsing-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'NoticePopupItem',
    components: {
        PButtonModal,
        PCheckBox,
        PBadge,
        PDivider,
    },
    props: {
        popupIndex: {
            type: Number,
            default: undefined,
        },
    },
    setup() {
        const state = reactive({
            popupVisible: true,
            isDontShowChecked: false,
            // below is dummy
            noticeItem: {
                notice_title: '[SpaceONE 작업 공지] SpaceONE 네트워크 작업 안내',
                notice_type: 'System Notice',
                created_at: '2022-01-01 12:14:16',
                author_type: 'SpaceONE SYSTEM',
                contents: '안녕하세요 SpaceONE 서비스 관리자 입니다.\n'
                    + '금일 아래의 일정으로, 서비스 안정성 향상을 위한 네트워크 작업을 진행 하오니 서비스 이용에 참고 부탁 드리겠습니다.\n'
                    + '\n'
                    + '작업 내역은 아래와 같습니다.\n'
                    + '\n'
                    + '- 일시 : 2022.01.12 19:00 ~ 2022.01.12 23:00(KST)\n'
                    + '- 작업 내용 : SpaceONE Console 서비스 방화벽 작업\n'
                    + '- 서비스 영향도 : 작업 시간내 간헐적 SpaceONE Console 접속 끊김\n'
                    + '\n'
                    + '작업을 통해 편리하고 안정적인 SpaceONE 이용이 될 수 있도록 최선을 다하겠습니다.\n'
                    + '감사합니다.',
            },
        });

        const handleClose = async () => {
            state.popupVisible = false;
            if (state.isDontShowChecked) {
                try {
                    await SpaceConnector.client.config.userConfig.set({
                        user_id: store.state.user.userId,
                        // name: `console:board:${BOARD_ID}:${POST_ID}`,
                        data: {
                            show_popup: state.isDontShowChecked,
                        },
                    });
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }
        };

        return {
            ...toRefs(state),
            handleClose,
            isMobile,
        };
    },
};
</script>
<style lang="postcss" scoped>
.notice-popup {
    .notice-popup-title {
        @apply font-bold mb-2;
    }
    .notice-popup-info {
        @apply flex items-center;
    }
    .notice-popup-author {
        @apply text-sm ml-1 text-gray-600;
    }
    .notice-popup-contents {
        @apply whitespace-pre-line text-sm leading-normal text-gray-900;
    }
}
</style>
