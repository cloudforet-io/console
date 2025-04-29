<script setup lang="ts">
import { reactive, computed } from 'vue';

import {
    PButtonModal, PDivider, PButton,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { PostModel } from '@/schema/board/post/model';

import { useNoticeStore } from '@/store/notice/notice-store';
import { useUserStore } from '@/store/user/user-store';

import { isMobile } from '@/lib/helper/cross-browsing-helper';

import TextEditorViewer from '@/common/components/editor/TextEditorViewer.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';

const props = withDefaults(defineProps<{
    popupIndex: number|string;
    item?: PostModel;
}>(), {
    item: undefined,
});
const noticeStore = useNoticeStore();
const userStore = useUserStore();

const state = reactive({
    popupVisible: true,
});
const contentsType = computed(() => (props.item ? props.item.contents_type ?? 'markdown' : 'markdown'));
const {
    editorContents,
} = useEditorContentTransformer({
    contents: computed(() => (props.item ? props.item.contents : '')),
    contentsType,
    resourceGroup: 'DOMAIN',
});

const handleClose = async (neverShowPopup?: boolean): Promise<void> => {
    state.popupVisible = false;
    if (!props.item) return;
    if (neverShowPopup) {
        await noticeStore.updateNoticeReadState(props.item.post_id, false);
    }
};
</script>

<template>
    <p-button-modal :visible="state.popupVisible && !!props.item"
                    :backdrop="false"
                    hide-header
                    hide-header-close-button
                    hide-footer-close-button
                    size="md"
                    :absolute="Number(props.popupIndex) * 1.5 + (isMobile() ? 0.75 : 7.5)"
                    class="notice-popup"
                    @confirm="handleClose"
    >
        <template #body>
            <h1 class="notice-popup-title">
                {{ props.item ? props.item.title : '' }}
            </h1>
            <div class="notice-popup-info">
                <span class="notice-popup-author">{{ iso8601Formatter(item.updated_at, userStore.state.timezone) }} · {{ item.writer }}</span>
            </div>
            <p-divider class="!my-4" />
            <text-editor-viewer :contents="editorContents"
                                :contents-type="contentsType"
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

<style lang="postcss" scoped>
.notice-popup {
    .notice-popup-title {
        @apply font-bold mb-2;
    }
    .notice-popup-info {
        @apply flex items-center;
    }
    .notice-popup-author {
        @apply text-sm text-gray-600;
    }
}
</style>
