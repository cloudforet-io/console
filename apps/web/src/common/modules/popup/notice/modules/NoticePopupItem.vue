<script lang="ts" setup>

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PBadge, PDivider, PButton,
} from '@spaceone/design-system';
import { computedAsync } from '@vueuse/core';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { FileInfo } from '@/lib/file-manager/type';
import { isMobile } from '@/lib/helper/cross-browsing-helper';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileAttachments } from '@/common/composables/file-attachments';

import { getPostBadgeInfo } from '@/services/info/notice/helper';
import type { NoticePostBadgeInfo, NoticePostModel } from '@/services/info/notice/type';

interface Props {
    popupIndex?: number;
    item: NoticePostModel;
}

const props = defineProps<Props>();
const { t } = useI18n();
const store = useStore();

const state = reactive({
    noticeTypeBadgeInfo: computed<NoticePostBadgeInfo>(() => getPostBadgeInfo(props.item?.post_type)),
    popupVisible: true,
});
const files = computedAsync<FileInfo[]>(async () => {
    const notice = props.item;
    if (!notice) return [];
    const result: NoticePostModel = await SpaceConnector.client.board.post.get({
        board_id: notice.board_id,
        post_id: notice.post_id,
    });
    return result.files;
});
const { attachments } = useFileAttachments(files);

const handleClose = async (neverShowPopup?: boolean): Promise<void> => {
    state.popupVisible = false;
    if (neverShowPopup) {
        try {
            await SpaceConnector.client.config.userConfig.set({
                user_id: store.state.user.userId,
                name: `console:board:${props.item.board_id}:${props.item.post_id}`,
                data: {
                    show_popup: false,
                },
            });
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }
};

</script>

<template>
    <p-button-modal :visible="state.popupVisible"
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
                {{ item.title }}
            </h1>
            <div class="notice-popup-info">
                <p-badge badge-type="solid-outline"
                         :style-type="state.noticeTypeBadgeInfo.style"
                >
                    {{ state.noticeTypeBadgeInfo.label }}
                </p-badge>
                <span class="notice-popup-author">{{ iso8601Formatter(item.updated_at, $store.state.user.timezone) }} · {{ item.writer }}</span>
            </div>
            <p-divider class="!my-4" />
            <text-editor-viewer :contents="item.contents"
                                :attachments="attachments"
            />
        </template>
        <template #footer-extra>
            <p-button style-type="tertiary"
                      size="lg"
                      @click="handleClose(true)"
            >
                {{ t('COMMON.POPUP.NOTICE.DO_NOT_SHOW') }}
            </p-button>
        </template>
        <template #confirm-button>
            <span>{{ t('COMMON.POPUP.NOTICE.CLOSE') }}</span>
        </template>
    </p-button-modal>
</template>

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
}
</style>
