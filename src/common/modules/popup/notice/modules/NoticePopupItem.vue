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
                <p-badge outline>
                    {{ item.scope }}
                </p-badge>
                <span class="notice-popup-author">{{ item.updated_at }} · {{ item.writer }}</span>
            </div>
            <p-divider class="my-4" />
            <p class="notice-popup-contents">
                {{ item.contents }}
            </p>
        </template>
        <template #footer-extra>
            <p-check-box v-model="neverShowPopup">
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
import type { PropType } from '@vue/composition-api';
import { reactive, toRefs } from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PButtonModal, PCheckBox, PBadge, PDivider,
} from '@spaceone/design-system';

import { store } from '@/store';

import { isMobile } from '@/lib/helper/cross-browsing-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { NoticePostModel } from '@/services/my-page/notice/type';

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
        item: {
            type: Object as PropType<NoticePostModel>,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            popupVisible: true,
            neverShowPopup: false,
        });

        const handleClose = async () => {
            state.popupVisible = false;
            if (state.neverShowPopup) {
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
