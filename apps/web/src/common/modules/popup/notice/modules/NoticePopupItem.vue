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
                {{ item.title }}
            </h1>
            <div class="notice-popup-info">
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
                {{ $t('COMMON.POPUP.NOTICE.DO_NOT_SHOW') }}
            </p-button>
        </template>
        <template #confirm-button>
            <span>{{ $t('COMMON.POPUP.NOTICE.CLOSE') }}</span>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { computedAsync } from '@vueuse/core';
import { reactive, toRefs } from 'vue';
import type { PropType } from 'vue';

import {
    PButtonModal, PDivider, PButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { iso8601Formatter } from '@cloudforet/utils';

import type { PostGetParameters } from '@/schema/board/post/api-verbs/get';
import type { PostModel } from '@/schema/board/post/model';

import { useNoticeStore } from '@/store/notice';

import type { FileInfo } from '@/lib/file-manager/type';
import { isMobile } from '@/lib/helper/cross-browsing-helper';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileAttachments } from '@/common/composables/file-attachments';

export default {
    name: 'NoticePopupItem',
    components: {
        PButtonModal,
        PDivider,
        TextEditorViewer,
        PButton,
    },
    props: {
        popupIndex: {
            type: Number,
            default: undefined,
        },
        item: {
            type: Object as PropType<PostModel>,
            default: undefined,
        },
    },
    setup(props) {
        const noticeStore = useNoticeStore();

        const state = reactive({
            popupVisible: true,
        });
        const files = computedAsync<FileInfo[]>(async () => {
            const notice = props.item;
            if (!notice) return [];
            try {
                const result: PostModel = await SpaceConnector.clientV2.board.post.get<PostGetParameters, PostModel>({
                    post_id: notice.post_id,
                });
                return result.files;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        });
        const { attachments } = useFileAttachments(files);

        const handleClose = async (neverShowPopup?: boolean): Promise<void> => {
            state.popupVisible = false;
            if (neverShowPopup) {
                await noticeStore.updateNoticeReadState(props.item.post_id, false);
            }
        };

        return {
            ...toRefs(state),
            attachments,
            handleClose,
            isMobile,
            iso8601Formatter,
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
}
</style>
