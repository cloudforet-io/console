<template>
    <div class="gnb-notice-tab">
        <p-data-loader :data="items"
                       :loading="loading"
                       :class="{ loading: loading && !items.length }"
        >
            <div ref="noticeItemsRef" class="content-wrapper">
                <template v-if="!!pinnedItems.length">
                    <div class="pinned-header-wrapper">
                        <p-i name="ic_pin"
                             width="1rem" height="1rem"
                             class="mr-1"
                        />
                        <!--song-lang-->
                        <span class="label">Pinned notice</span>
                    </div>
                    <g-n-b-noti-item v-for="(item, idx) in pinnedItems" :key="`${item.postId}-${idx}`"
                                     :title="item.title"
                                     :created-at="item.createdAt"
                                     :is-read="true"
                                     :writer="item.writer"
                                     @select="handleSelectNotice(item.postId)"
                    />
                    <p-divider />
                </template>
                <g-n-b-noti-item v-for="(item, idx) in items" :key="`${item.postId}-${idx}`"
                                 :title="item.title"
                                 :created-at="item.createdAt"
                                 :is-read="true"
                                 :writer="item.writer"
                                 @select="handleSelectNotice(item.postId)"
                />
            </div>
            <div class="view-all-button-wrapper">
                <!--song-lang-->
                <div class="view-all-button" @click="handleClickViewAllNotice">
                    View all notice
                </div>
            </div>
            <template #no-data>
                <div class="no-data">
                    <img class="img" src="@/assets/images/illust_ghost.svg">
                    <p class="title">
                        <!--song-lang-->
                        No Notice
                    </p>
                    <p class="desc">
                        <!--song-lang-->
                        <span>Any new notice will appear here.</span>
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PDataLoader, PI, PDivider,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { getNoticeBoardId } from '@/lib/helper/notice-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import GNBNotiItem from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotiItem.vue';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { INFO_ROUTE } from '@/services/info/route-config';


interface NoticeItem {
    postId: string;
    createdAt: string;
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
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            noticeItemsRef: null as HTMLElement|null,
            pinnedItems: [] as NoticeItem[],
            items: [] as NoticeItem[],
            proxyCount: useProxyValue('count', props, emit),
        });

        /* Util */
        const convertNoticeItem = (rawData: any[]): [NoticeItem[], NoticeItem[]] => {
            const items: NoticeItem[] = [];
            const pinnedItems: NoticeItem[] = [];
            rawData.forEach((d) => {
                const item = {
                    postId: d.post_id,
                    createdAt: d.created_at,
                    title: d.title,
                    writer: d.writer,
                    isPinned: d.options.is_pinned,
                };
                if (d.options.is_pinned) pinnedItems.push(item);
                else items.push(item);
            });
            return [items, pinnedItems];
        };

        /* Api */
        const noticeApiHelper = new ApiQueryHelper()
            .setPage(1, NOTICE_ITEM_LIMIT)
            .setSort('created_at', true);
        const listNotice = async (boardId: string) => {
            try {
                const { results, total_count } = await SpaceConnector.client.board.post.list({
                    board_id: boardId,
                    query: noticeApiHelper.data,
                });
                state.proxyCount = total_count;
                [state.items, state.pinnedItems] = convertNoticeItem(results);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
                state.proxyCount = 0;
                state.items = [];
                state.pinnedItems = [];
            }
        };

        /* Event */
        const handleSelectNotice = (postId: string) => {
            emit('close');
            SpaceRouter.router.push({
                name: INFO_ROUTE.NOTICE.DETAIL._NAME,
                params: { id: postId },
            }).catch(() => {});
        };
        const handleClickViewAllNotice = () => {
            emit('close');
            SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE._NAME }).catch(() => {});
        };

        /* Init */
        const init = async () => {
            state.loading = true;
            const boardId = await getNoticeBoardId();
            if (boardId) await listNotice(boardId);
            state.loading = false;
        };
        (async () => {
            await init();
        })();

        return {
            ...toRefs(state),
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

    .p-data-loader::v-deep {
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
            @apply text-gray-500;
            font-size: 0.75rem;
            font-weight: 700;
            line-height: 1.5;
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
            padding: 0 0.75rem;
        }
    }
    .view-all-button-wrapper {
        @apply border-t border-gray-200;
        position: absolute;
        bottom: 0;
        height: 3rem;
        width: 100%;
        padding: 0.5rem;
        .view-all-button {
            display: flex;
            cursor: pointer;
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
    .no-data {
        text-align: center;
        padding: 4rem 3.25rem;
        .img {
            margin: auto;
            padding-bottom: 1.5rem;
        }
        .title {
            @apply text-violet-300;
            font-size: 1.125rem;
            font-weight: 700;
            opacity: 0.8;
            line-height: 1.25;
            margin-bottom: 0.25rem;
        }
        .desc {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
        }
    }

    @screen mobile {
        .no-data-wrapper {
            img {
                margin-top: 2.5rem;
                max-height: 8.75rem;
            }
            .title {
                font-weight: normal;
            }
            .desc {
                span:first-of-type {
                    display: block;
                }
            }
        }
    }
}
</style>
