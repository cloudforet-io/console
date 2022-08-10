<template>
    <div class="notice-list">
        <div class="notice-header">
            <p-toolbox :pagination-visible="false" :page-size-changeable="false" :refreshable="false">
                <template #left-area>
                    <p-select-dropdown :items="dropdownItems" :selected="selectedItem" />
                </template>
            </p-toolbox>
        </div>
        <p-data-loader :data="noticeItems" :loading="loading">
            <ul v-if="noticeItems.length" class="list-wrapper">
                <!-- // todo: item.[id]-->
                <list-item v-for="(item, index) in noticeItems"
                           :key="`notice-${item.post_id}-${index}`"
                           class="list-item"
                           :post="item"
                           :notice-type="item.scope"
                           :is-new="false"
                           :is-pinned="item.options.is_pinned"
                           @click.native="handleClickNotice(item.post_id)"
                />
            </ul>
            <div v-else class="no-data">
                <img src="@/assets/images/illust_satellite.svg" class="no-data-img">
                <p class="no-data-text">
                    <!--song-lang-->
                    {{ $t('No notices') }}
                </p>
            </div>
            <div class="pagination-wrapper">
                <p-pagination class="pagination"
                              :total-count="noticeItems.length"
                              :page-size="10"
                              :current-page="1"
                />
            </div>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import { defineComponent, reactive, toRefs } from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PDataLoader,
    PPagination, PSelectDropdown, PToolbox,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { getNoticeBoardId } from '@/lib/helper/notice-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { NOTICE_TYPE } from '@/services/info/notice/config';
import ListItem from '@/services/info/notice/modules/list-item/ListItem.vue';
import type { NoticePostModel } from '@/services/info/notice/type';
import { INFO_ROUTE } from '@/services/info/route-config';


interface Props {
    noticeItems: any[];
    loading: boolean;
}

const NOTICE_ITEM_LIMIT = 10;

export default defineComponent<Props>({
    name: 'NoticeList',
    components: {
        PToolbox,
        PSelectDropdown,
        PPagination,
        PDataLoader,
        ListItem,
    },
    setup() {
        const state = reactive({
            dropdownItems: [
                {
                    // song-lang
                    label: '전체 공지',
                    name: 'ALL',
                },
                {
                    // song-lang
                    label: '시스템 공지',
                    name: NOTICE_TYPE.SYSTEM,
                },
                {
                    // song-lang
                    label: '내부 공지',
                    name: NOTICE_TYPE.DOMAIN,
                },
            ],
            selectedItem: 'ALL',
            loading: false,
            noticeItems: [] as NoticePostModel[],
        });

        /* Api */
        const noticeApiHelper = new ApiQueryHelper()
            .setPage(1, NOTICE_ITEM_LIMIT)
            .setSort('created_at', true);
        const listNotice = async (boardId: string) => {
            try {
                const { results } = await SpaceConnector.client.board.post.list({
                    board_id: boardId,
                    query: noticeApiHelper.data,
                });
                state.noticeItems = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.noticeItems = [];
            }
        };

        const handleClickNotice = (id: string) => {
            SpaceRouter.router.push({ name: INFO_ROUTE.NOTICE.DETAIL._NAME, params: { id } });
        };

        (async () => {
            state.loading = true;
            const boardId = await getNoticeBoardId();
            if (boardId) await listNotice(boardId);
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            handleClickNotice,
        };
    },
});
</script>
<style lang="postcss" scoped>
.notice-list {
    @apply border border-gray-200 bg-white rounded-lg;
}
.notice-header {
    padding: 0 1rem;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}
.list-wrapper {
    @apply border-t border-b border-gray-200 rounded-none;
}
.pagination-wrapper {
    @apply flex justify-center;
    padding: 0.75rem 0 1rem 0;
}
.no-data {
    @apply border-t border-b border-gray-200 rounded-none;
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
    }
}

</style>
