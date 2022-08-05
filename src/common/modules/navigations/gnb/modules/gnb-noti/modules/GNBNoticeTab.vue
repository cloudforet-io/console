<template>
    <div class="gnb-notice-tab">
        <p-data-loader :data="items"
                       :loading="loading"
                       :class="{ loading: loading && !items.length }"
        >
            <div ref="noticeItemsRef" class="content-wrapper">
                <g-n-b-noti-item v-for="(item, idx) in items" :key="`${item.postId}-${idx}`"
                                 :title="item.title"
                                 :created-at="item.createdAt"
                                 @select="handleSelectNotice(item.postId)"
                                 @delete="handleDeleteNotice(item.postId)"
                />
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
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

// import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
// import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PDataLoader,
} from '@spaceone/design-system';
// import dayjs from 'dayjs';

import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import GNBNotiItem from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotiItem.vue';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';


interface NoticeItem {
    postId: string;
    createdAt: string;
    title: string;
    writer: string;
}

// const NOTICE_ITEM_LIMIT = 15;

export default {
    name: 'GNBNoticeTab',
    components: {
        GNBNotiItem,
        PDataLoader,
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
            items: [] as NoticeItem[],
            proxyCount: useProxyValue('count', props, emit),
        });

        /* Util */
        // const convertNoticeItem = (rawData: any[]) => {
        //     const results: NoticeItem[] = [];
        //     rawData.forEach((d) => {
        //         const result: NoticeItem = {
        //             postId: d.postId,
        //             createdAt: d.created_at,
        //             title: d.title,
        //             writer: d.writer,
        //         };
        //         results.push(result);
        //     });
        //     return results;
        // };

        /* Api */
        // const noticeApiHelper = new ApiQueryHelper()
        //     .setPage(1, NOTICE_ITEM_LIMIT)
        //     .setSort('created_at', true);
        const listNotice = async () => {
            state.loading = true;
            try {
                // const { results, total_count } = await SpaceConnector.client.board.board.list({
                //     query: noticeApiHelper.data,
                // });
                // state.proxyCount = total_count;
                // state.items = convertNoticeItem(results);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
            } finally {
                state.loading = false;
                state.proxyCount = 0;
                state.items = [];
            }
        };

        /* Event */
        const handleSelectNotice = (postId: string) => {
            console.log('select!', postId);
        };
        const handleDeleteNotice = (postId: string) => {
            console.log('delete!', postId);
        };

        /* Init */
        const init = async () => {
            if (state.noticeItemsRef) state.noticeItemsRef.scrollTop = 0;
            await listNotice();
        };

        /* Watcher */
        watch(() => props.visible, (visible) => {
            if (visible) init();
        });

        return {
            ...toRefs(state),
            ADMINISTRATION_ROUTE,
            handleSelectNotice,
            handleDeleteNotice,
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
                max-height: inherit;
            }
        }
    }
    .content-wrapper {
        max-height: calc(100vh - $gnb-height - 1.5rem - 2.75rem);
        overflow-y: scroll;
        padding: 0.25rem 0.5rem 0.5rem 0.5rem;
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
