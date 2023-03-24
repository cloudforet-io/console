<template>
    <div class="notice-list">
        <div class="notice-header">
            <p-toolbox :pagination-visible="false"
                       :page-size-changeable="false"
                       :refreshable="false"
                       @change="handleToolboxChange"
            >
                <template #left-area>
                    <p-select-dropdown v-if="domainName !== 'root'"
                                       :items="dropdownItems"
                                       :selected="selectedPostType"
                                       @update:selected="handleSearchPostTypeChange"
                    />
                </template>
            </p-toolbox>
        </div>
        <p-divider />
        <p-data-loader :data="noticeItems"
                       :loading="loading"
        >
            <ul class="list-wrapper">
                <list-item v-for="(item, index) in noticeItems"
                           :key="`notice-${item.post_id}-${index}`"
                           class="list-item"
                           :post="item"
                           :is-new="!isReadMap[item.post_id]"
                           :input-text="searchText"
                           @click.native="handleClickNotice(item.post_id)"
                />
            </ul>
            <template #no-data>
                <div v-if="!searchText || !searchText.length"
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
                                <em>{{ searchText }}</em>
                            </template>
                        </i18n>
                    </p>
                </div>
            </template>
        </p-data-loader>
        <div class="pagination-wrapper">
            <p-pagination :total-count="noticeItemTotalCount"
                          :page-size="10"
                          @change="handlePageChange"
            />
        </div>
    </div>
</template>

<script lang="ts">

import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PDataLoader, PDivider,
    PPagination, PSelectDropdown, PToolbox,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ConsoleFilter } from '@/query/type';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useNoticeStore } from '@/store/notice';

import { getNoticeBoardId } from '@/lib/helper/notice-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { NoticePostType } from '@/services/info/notice/config';
import { NOTICE_POST_TYPE } from '@/services/info/notice/config';
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
        PDivider,
        ListItem,
    },
    setup() {
        const state = reactive({
            domainName: computed<string|undefined>(() => store.state.domain.name),
            dropdownItems: computed(() => [
                {
                    label: i18n.t('INFO.NOTICE.MAIN.LABEL_ALL_NOTI'),
                    name: 'ALL',
                },
                {
                    label: i18n.t('INFO.NOTICE.MAIN.LABEL_SYSTEM_NOTI'),
                    name: NOTICE_POST_TYPE.SYSTEM,
                },
                {
                    label: i18n.t('INFO.NOTICE.MAIN.LABEL_DOMAIN_NOTI'),
                    name: NOTICE_POST_TYPE.INTERNAL,
                },
            ]),
            selectedPostType: 'ALL' as NoticePostType | 'ALL',
            loading: false,
            noticeItems: [] as NoticePostModel[],
            noticeItemTotalCount: 0,
            boardId: undefined as undefined | string,
            searchText: undefined as undefined | string,
        });

        const {
            isReadMap, fetchNoticeReadState,
        } = useNoticeStore({
            userId: computed(() => store.state.user.userId),
        });

        /* Api */
        const initNoticeApiHelper = () => {
            const initApiHelper = new ApiQueryHelper()
                .setPage(1, NOTICE_ITEM_LIMIT)
                .setMultiSort([{ key: 'options.is_pinned', desc: true }, { key: 'created_at', desc: true }]);
            if (state.domainName === 'root') {
                return initApiHelper.setFilters([{ k: 'post_type', v: NOTICE_POST_TYPE.SYSTEM, o: '=' }]);
            }
            return initApiHelper;
        };
        let noticeApiHelper = initNoticeApiHelper();
        const listNotice = async () => {
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.client.board.post.list({
                    board_id: state.boardId,
                    query: noticeApiHelper.data,
                    domain_id: null,
                });
                state.noticeItems = results;
                state.noticeItemTotalCount = total_count;
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
            const filterHelper = new ApiQueryHelper()
                .setPage(1, NOTICE_ITEM_LIMIT)
                .setSort('created_at', true);
            const filter = [] as ConsoleFilter[];
            if (state.selectedPostType !== 'ALL') filter.push({ k: 'post_type', v: state.selectedPostType, o: '=' });
            if (state.searchText) filter.push({ k: 'title', v: state.searchText, o: '' });
            filterHelper.setFilters(filter);
            return filterHelper;
        };
        const loadSearchListSet = async () => {
            if (!state.searchText) {
                noticeApiHelper = initNoticeApiHelper();
                if (state.selectedPostType !== 'ALL') noticeApiHelper.setFilters([{ k: 'post_type', v: state.selectedPostType, o: '=' }]);
            } else {
                noticeApiHelper = getSearchFilter();
            }
            if (state.boardId) await listNotice();
        };

        /* event */
        const handleToolboxChange = (options: ToolboxOptions = {}) => {
            state.searchText = options?.searchText;
            loadSearchListSet();
        };
        const handleSearchPostTypeChange = (searchScope: NoticePostType|'ALL') => {
            state.selectedPostType = searchScope;
            loadSearchListSet();
        };
        const handleClickNotice = (postId: string) => {
            SpaceRouter.router.push({
                name: INFO_ROUTE.NOTICE.DETAIL._NAME,
                params: {
                    boardId: state.boardId ?? '',
                    postId,
                },
            });
        };
        const handlePageChange = (page: number) => {
            noticeApiHelper.setPage(getPageStart(page, NOTICE_ITEM_LIMIT), NOTICE_ITEM_LIMIT);
            if (state.boardId) listNotice();
        };

        (async () => {
            state.loading = true;
            state.boardId = await getNoticeBoardId();
            if (state.boardId) {
                await Promise.allSettled([fetchNoticeReadState(state.boardId), listNotice()]);
            }
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            isReadMap,
            handleToolboxChange,
            handleClickNotice,
            handlePageChange,
            handleSearchPostTypeChange,
        };
    },
});
</script>
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

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader .no-data-wrapper) {
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
