<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDataLoader, PDivider,
    PPagination, PToolbox,
    PButton,
} from '@cloudforet/mirinae';
import type { ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PostListParameters } from '@/schema/board/post/api-verbs/list';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { PostModel } from '@/schema/board/post/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useNoticeStore } from '@/store/notice/notice-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import NoticeListItem from '@/services/info/components/NoticeListItem.vue';
import NoticeWorkspaceDropdown from '@/services/info/components/NoticeWorkspaceDropdown.vue';
import { ADMIN_INFO_ROUTE } from '@/services/info/routes/admin/route-constant';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import type { WorkspaceDropdownMenuItem } from '@/services/info/types/notice-type';

const NOTICE_ITEM_LIMIT = 10;

const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const noticeStore = useNoticeStore();
const noticeGetters = noticeStore.getters;
const router = useRouter();
const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
});
const state = reactive({
    loading: false,
    noticeItems: [] as PostModel[],
    noticeItemTotalCount: 0,
    searchText: undefined as undefined | string,
    tools: computed<ValueItem[]>(() => ([
        { name: 'all', label: i18n.t('INFO.NOTICE.ALL_WORKSPACE') as string },
        { name: 'specific', label: i18n.t('INFO.NOTICE.FORM.SPECIFIC_WORKSPACE') as string },
    ])),
    selectedToolId: undefined as string|undefined,
    selectedItems: [] as WorkspaceDropdownMenuItem[],
    queryFilter: [] as ConsoleFilter[],
});

/* Api */
const noticeApiHelper = new ApiQueryHelper()
    .setPage(1, NOTICE_ITEM_LIMIT)
    .setMultiSort([{ key: 'options.is_pinned', desc: true }, { key: 'created_at', desc: true }]);

const listNotice = async () => {
    state.loading = true;

    if (state.searchText) {
        const titleFilter = state.queryFilter.findIndex((filter) => filter.k === 'title');
        if (titleFilter === -1) {
            state.queryFilter.push({ k: 'title', v: state.searchText, o: '' });
        } else {
            state.queryFilter[titleFilter].v = state.searchText;
        }
    }

    noticeApiHelper.setFilters(state.queryFilter);

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

/* event */
const handleToolboxChange = (options: ToolboxOptions = {}) => {
    if (options?.searchText !== undefined) state.searchText = options?.searchText;
    listNotice();
};
const handleClickNotice = (postId: string) => {
    const noticeDetailRouteName = storeState.isAdminMode ? ADMIN_INFO_ROUTE.NOTICE.DETAIL._NAME : INFO_ROUTE.NOTICE.DETAIL._NAME;
    router.push({
        name: noticeDetailRouteName,
        params: {
            postId,
        },
    }).catch(() => {});
};
const handlePageChange = (page: number) => {
    noticeApiHelper.setPage(getPageStart(page, NOTICE_ITEM_LIMIT), NOTICE_ITEM_LIMIT);
    listNotice();
};
const handleClickToolButton = (value: string) => {
    if (value === state.selectedToolId) state.selectedToolId = undefined;
    else state.selectedToolId = value;
};

watch(() => state.selectedToolId, (selectedToolId) => {
    state.selectedItems = [];
    state.queryFilter = [];
    state.searchText = '';

    if (selectedToolId === 'all') {
        state.queryFilter = [{ k: 'workspace_id', v: ['*'], o: '=' }];
    } else state.queryFilter = [];

    listNotice();
});
watch(() => state.selectedItems, (selectedItems) => {
    if (state.selectedToolId !== 'specific') return;

    if (selectedItems.length > 0) {
        const workspaceIds = selectedItems.map((item) => item.name);
        state.queryFilter = [{ k: 'workspace_id', v: workspaceIds, o: '=' }];
    } else {
        state.queryFilter = [];
    }

    listNotice();
});

(async () => {
    state.loading = true;
    await Promise.allSettled([noticeStore.fetchNoticeReadState(), listNotice()]);
    state.loading = false;
})();
</script>

<template>
    <div class="notice-list">
        <div class="notice-header-wrapper">
            <div v-if="storeState.isAdminMode"
                 class="notice-header"
            >
                <p-button v-for="(item, idx) in state.tools"
                          :key="idx"
                          class="workspace-button"
                          style-type="transparent"
                          :class="{'active': state.selectedToolId === item.name}"
                          @click="handleClickToolButton(item.name)"
                >
                    {{ item.label }}
                </p-button>
                <notice-workspace-dropdown v-if="state.selectedToolId === 'specific'"
                                           :selected-items.sync="state.selectedItems"
                                           class="dropdown"
                                           :class="{'is-multi-selected': state.selectedItems.length > 1}"
                />
            </div>
            <p-toolbox :pagination-visible="false"
                       :page-size-changeable="false"
                       :refreshable="false"
                       :search-text="state.searchText"
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
    .notice-header-wrapper {
        @apply flex flex-col;
        padding: 0 1rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        .notice-header {
            @apply flex items-center;
            margin-bottom: 0.75rem;
            .workspace-button {
                @apply border border-gray-300 font-normal;
                border-radius: 0.25rem 0 0 0.25rem;
                +.workspace-button {
                    border-left-width: 0;
                    border-radius: 0 0.25rem 0.25rem 0;
                }
                &:hover, &:focus {
                    @apply text-gray-900;
                }
                &.active {
                    @apply bg-secondary border-secondary text-white;
                }
            }
            .dropdown {
                width: 20rem;
                margin-top: 0;
                margin-left: 0.75rem;
                &.no-data {
                    padding: 0;
                }
                &.is-multi-selected {
                    :deep(.notice-workspace-dropdown .label) {
                        max-width: 12rem;
                    }
                }
            }
            :deep(.notice-workspace-dropdown .label) {
                @apply truncate;
                max-width: 15rem;
            }
        }
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
