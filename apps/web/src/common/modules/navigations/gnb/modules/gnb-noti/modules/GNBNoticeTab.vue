<template>
    <div class="gnb-notice-tab">
        <p-data-loader :data="items"
                       :loading="loading"
                       :class="{ loading: loading && !items.length }"
        >
            <div ref="noticeItemsRef"
                 class="content-wrapper"
            >
                <template v-if="!!pinnedItems.length">
                    <div class="pinned-header-wrapper">
                        <p-i name="ic_pin-filled"
                             width="1rem"
                             height="1rem"
                             class="mr-1"
                        />
                        <span class="label">{{ $t('COMMON.GNB.NOTICE.PINNED_NOTICE') }}</span>
                    </div>
                    <g-n-b-noti-item v-for="(item, idx) in pinnedItems"
                                     :key="`${item.postId}-${idx}`"
                                     :title="item.title"
                                     :created-at="item.createdAt"
                                     :is-read="isReadMap[item.postId]"
                                     :writer="item.writer"
                                     @select="handleSelectNotice(item.postId)"
                    />
                    <p-divider class="divider" />
                </template>
                <g-n-b-noti-item v-for="(item, idx) in items"
                                 :key="`${item.postId}-${idx}`"
                                 :title="item.title"
                                 :created-at="item.createdAt"
                                 :is-read="isReadMap[item.postId]"
                                 :writer="item.writer"
                                 @select="handleSelectNotice(item.postId)"
                />
            </div>
            <div class="view-all-button-wrapper">
                <div class="view-all-button"
                     @click="handleClickViewAllNotice"
                >
                    {{ $t('COMMON.GNB.NOTICE.VIEW_ALL') }}
                </div>
            </div>
            <template #no-data>
                <p-empty
                    show-image
                    :title="$t('COMMON.GNB.NOTICE.NO_NOTICE')"
                >
                    <template #image>
                        <img alt="empty-image"
                             src="@/assets/images/illust_ghost.svg"
                        >
                    </template>
                    {{ $t('COMMON.GNB.NOTICE.NO_NOTICE_DESC') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PDataLoader, PI, PDivider, PEmpty,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { TimeStamp } from '@/models';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useNoticeStore } from '@/store/notice';

import { getNoticeBoardId } from '@/lib/helper/notice-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import GNBNotiItem from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotiItem.vue';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { NOTICE_POST_TYPE } from '@/services/info/notice/config';
import type { NoticePostModel } from '@/services/info/notice/type';
import { INFO_ROUTE } from '@/services/info/route-config';

interface NoticeItem {
    postId: string;
    createdAt: TimeStamp;
    title: string;
    writer: string;
    isPinned: boolean;
}

const NOTICE_ITEM_LIMIT = 15;

export default {
    name: 'GNBNoticeTab',
    components: {
        GNBNotiItem,
        PDataLoader,
        PI,
        PDivider,
        PEmpty,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            boardId: undefined as undefined | string,
            noticeItemsRef: null as HTMLElement|null,
            noticeData: [] as NoticePostModel[],
            items: computed<NoticeItem[]>(() => {
                const filteredData = state.noticeData.filter((d) => !d.options.is_pinned);
                return convertNoticeItem(filteredData);
            }),
            pinnedItems: computed<NoticeItem[]>(() => {
                const filteredData = state.noticeData.filter((d) => d.options.is_pinned);
                return convertNoticeItem(filteredData);
            }),
            domainName: computed(() => store.state.domain.name),
        });

        /* Util */
        const convertNoticeItem = (rawData: NoticePostModel[]): NoticeItem[] => rawData.map((d) => ({
            postId: d.post_id,
            createdAt: d.created_at,
            title: d.title,
            writer: d.writer,
            isPinned: d.options.is_pinned,
        }));

        const {
            isReadMap, fetchNoticeReadState,
        } = useNoticeStore({
            userId: computed(() => store.state.user.userId),
        });

        /* Api */
        const noticeApiHelper = new ApiQueryHelper()
            .setPage(1, NOTICE_ITEM_LIMIT)
            .setMultiSort([{ key: 'options.is_pinned', desc: true }, { key: 'created_at', desc: true }]);
        if (state.domainName === 'root') {
            noticeApiHelper.setFilters([{ k: 'post_type', v: NOTICE_POST_TYPE.SYSTEM, o: '=' }]);
        }
        const listNotice = async () => {
            try {
                const { results, total_count } = await SpaceConnector.client.board.post.list({
                    board_id: state.boardId,
                    query: noticeApiHelper.data,
                    domain_id: null,
                });
                state.proxyCount = total_count;
                state.noticeData = results;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
                state.proxyCount = 0;
                state.noticeData = [];
            }
        };

        /* Event */
        const handleSelectNotice = (postId: string) => {
            emit('close');
            SpaceRouter.router.push({
                name: INFO_ROUTE.NOTICE.DETAIL._NAME,
                params: { boardId: state.boardId, postId },
            }).catch(() => {});
        };
        const handleClickViewAllNotice = () => {
            emit('close');
            SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME }).catch(() => {});
        };

        /* Init */
        const init = async () => {
            state.loading = true;
            state.boardId = await getNoticeBoardId();
            if (state.boardId) {
                await Promise.allSettled([fetchNoticeReadState(), listNotice()]);
            }
            state.loading = false;
        };
        (async () => {
            await init();
        })();

        return {
            ...toRefs(state),
            isReadMap,
            ADMINISTRATION_ROUTE,
            handleSelectNotice,
            handleClickViewAllNotice,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-notice-tab {
    @apply bg-white;
    display: flex;
    flex-direction: column;

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 13rem;
        }
        .data-loader-container {
            .no-data-wrapper {
                position: relative;
                max-height: inherit;
            }
        }
    }
    .content-wrapper {
        max-height: calc(100vh - $gnb-height - 1.5rem - 2.75rem);
        overflow-y: scroll;
        padding: 0.25rem 0.5rem 3.5rem 0.5rem;
        .pinned-header-wrapper {
            @apply text-gray-500 flex items-center;
            font-size: 0.75rem;
            font-weight: 700;
            line-height: 1.5;
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
            padding: 0 0.75rem;
        }
        .divider {
            margin: 0.5rem 0;
        }
    }
    .view-all-button-wrapper {
        @apply bg-white border-t border-gray-200;
        position: absolute;
        bottom: 0;
        height: 3rem;
        width: 100%;
        padding: 0.5rem;
        .view-all-button {
            display: flex;
            cursor: pointer;
            font-size: 0.875rem;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;

            @media (hover: hover) {
                &:hover {
                    @apply bg-primary-4 text-primary rounded;
                }
            }
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    text-align: center;
    padding: 4rem 3.25rem;
}
</style>
