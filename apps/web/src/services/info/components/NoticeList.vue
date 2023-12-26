<script setup lang="ts">

import { reactive } from 'vue';

import {
    PDataLoader, PDivider,
    PPagination, PToolbox,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PostListParameters } from '@/schema/board/post/api-verbs/list';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';
import { i18n } from '@/translations';

import { useNoticeStore } from '@/store/notice';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NoticeListItem from '@/services/info/components/NoticeListItem.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';

const NOTICE_ITEM_LIMIT = 10;

const state = reactive({
    loading: false,
    noticeItems: [] as PostModel[],
    noticeItemTotalCount: 0,
    searchText: undefined as undefined | string,
});

const noticeStore = useNoticeStore();
const noticeGetters = noticeStore.getters;

/* Api */
const initNoticeApiHelper = () => {
    const initApiHelper = new ApiQueryHelper()
        .setPage(1, NOTICE_ITEM_LIMIT)
        .setMultiSort([{ key: 'is_pinned', desc: true }, { key: 'created_at', desc: true }]);
    return initApiHelper;
};
let noticeApiHelper = initNoticeApiHelper();
const listNotice = async () => {
    state.loading = true;
    try {
        const { results, total_count } = await SpaceConnector.clientV2.board.post.list<PostListParameters, ListResponse<PostModel>>({
            query: noticeApiHelper.data,
            board_type: POST_BOARD_TYPE.NOTICE,
        });
        state.noticeItems = results ?? [];
        state.noticeItemTotalCount = total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.noticeItems = [];
        state.noticeItemTotalCount = 0;
    } finally {
        state.loading = false;
    }
};

/* Util */
const getSearchFilter = () => {
    const apiHelper = new ApiQueryHelper()
        .setPage(1, NOTICE_ITEM_LIMIT)
        .setSort('created_at', true);
    const filter = [] as ConsoleFilter[];
    if (state.searchText) filter.push({ k: 'title', v: state.searchText, o: '' });
    apiHelper.setFilters(filter);
    return apiHelper;
};
const loadSearchListSet = async () => {
    if (!state.searchText) {
        noticeApiHelper = initNoticeApiHelper();
    } else {
        noticeApiHelper = getSearchFilter();
    }
    await listNotice();
};

/* event */
const handleToolboxChange = (options: ToolboxOptions = {}) => {
    if (options?.searchText !== undefined) state.searchText = options?.searchText;
    loadSearchListSet();
};
const handleClickNotice = (postId: string) => {
    SpaceRouter.router.push({
        name: INFO_ROUTE.NOTICE.DETAIL._NAME,
        params: {
            postId,
        },
    });
};
const handlePageChange = (page: number) => {
    noticeApiHelper.setPage(getPageStart(page, NOTICE_ITEM_LIMIT), NOTICE_ITEM_LIMIT);
    listNotice();
};

(async () => {
    state.loading = true;
    await Promise.allSettled([noticeStore.fetchNoticeReadState(), listNotice()]);
    state.loading = false;
})();

</script>

<template>
    <div class="notice-list">
        <div class="notice-header">
            <p-toolbox :pagination-visible="false"
                       :page-size-changeable="false"
                       :refreshable="false"
                       @change="handleToolboxChange"
            />
        </div>
        <p-divider />
        <p-data-loader :data="state.noticeItems"
                       :loading="state.loading"
                       :min-loading-time="1000"
                       class="notice-list-loader"
        >
            <ul class="list-wrapper">
                <notice-list-item v-for="(item, index) in state.noticeItems"
                                  :key="`notice-${item.post_id}-${index}`"
                                  class="list-item"
                                  :post="item"
                                  :is-new="!noticeGetters.isReadMap[item.post_id]"
                                  :input-text="state.searchText"
                                  :loading="false"
                                  @click.native="handleClickNotice(item.post_id)"
                />
            </ul>
            <template #no-data>
                <div v-if="!state.searchText || !state.searchText.length"
                     class="no-data"
                >
                    <img src="@/assets/images/illust_satellite.svg"
                         class="no-data-img"
                    >
                    <p class="no-data-text">
                        {{ $t('INFO.NOTICE.NO_NOTICES') }}
                    </p>
                </div>
                <div v-else
                     class="no-data"
                >
                    <img src="@/assets/images/illust_ghost.svg"
                         class="img-no-data-ghost"
                    >
                    <p class="no-data-text">
                        <i18n path="COMMON.GNB.SEARCH.NO_RESULT_1">
                            <template #inputText>
                                <em>{{ state.searchText }}</em>
                            </template>
                        </i18n>
                    </p>
                </div>
            </template>
        </p-data-loader>
        <div class="pagination-wrapper">
            <p-pagination :total-count="state.noticeItemTotalCount"
                          :page-size="10"
                          @change="handlePageChange"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.notice-list {
    @apply border border-gray-200 bg-white rounded-lg;
    .notice-header {
        padding: 0 1rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }
    .list-wrapper {
        @apply rounded-none;
    }
    .pagination-wrapper {
        @apply flex justify-center border-t border-gray-200;
        padding: 0.75rem 0 1rem 0;
    }

    .notice-list-loader {
        min-height: 10rem;
    }

    /* custom design-system component - p-data-loader */
    :deep(.notice-list-loader.p-data-loader .no-data-wrapper) {
        max-height: none;
    }

    .no-data {
        @apply rounded-none;
        padding: 6rem 0;
        .no-data-img {
            @apply ml-auto mr-auto;
            width: 12rem;
        }

        .no-data-text {
            @apply text-gray-300;
            text-align: center;
            margin-top: 2rem;
            font-size: 1rem;
            line-height: 1.25;
            em {
                @apply font-bold text-gray-500;
            }
        }

        .img-no-data-ghost {
            display: inline-block;
        }
    }
}

</style>
