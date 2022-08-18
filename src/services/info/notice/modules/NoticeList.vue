<template>
    <div class="notice-list">
        <div class="notice-header">
            <p-toolbox :pagination-visible="false" :page-size-changeable="false" :refreshable="false"
                       @change="handleToolboxChange"
            >
                <template #left-area>
                    <p-select-dropdown :items="dropdownItems" :selected.sync="selectedScope" />
                </template>
            </p-toolbox>
        </div>
        <p-data-loader :data="noticeItems" :loading="loading">
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
                <div class="no-data">
                    <img src="@/assets/images/illust_satellite.svg" class="no-data-img">
                    <p class="no-data-text">
                        {{ $t('INFO.NOTICE.NO_NOTICES') }}
                    </p>
                </div>
            </template>
            <div class="pagination-wrapper">
                <p-pagination class="pagination"
                              :total-count="noticeItemTotalCount"
                              :page-size="10"
                              :current-page="1"
                              @change="handlePageChange"
                />
            </div>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PDataLoader,
    PPagination, PSelectDropdown, PToolbox,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/dist/src/navigation/toolbox/type';

import type { QueryStoreFilter } from '@/query/type';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

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

interface UserConfig {
    name: string;
    data?: {
        is_read: boolean,
        show_popup: boolean,
    };
    tags?: { [key: string]: string };
    user_id?: string;
    domain_id?: string;
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
            hasSystemRole: computed<boolean>(() => store.getters['user/hasSystemRole']),
            dropdownItems: [
                {
                    label: i18n.t('INFO.NOTICE.MAIN.LABEL_ALL_NOTI'),
                    name: 'ALL',
                },
                {
                    label: i18n.t('INFO.NOTICE.MAIN.LABEL_SYSTEM_NOTI'),
                    name: NOTICE_TYPE.SYSTEM,
                },
                {
                    label: i18n.t('INFO.NOTICE.MAIN.LABEL_DOMAIN_NOTI'),
                    name: NOTICE_TYPE.DOMAIN,
                },
            ],
            selectedScope: 'ALL',
            loading: false,
            noticeItems: [] as NoticePostModel[],
            noticeItemTotalCount: 0,
            boardId: undefined as undefined | string,
            searchText: undefined as undefined | string,
            userConfigs: [] as UserConfig[],
            isReadMap: computed<{ [key: string]: boolean }>(() => {
                const isReadMap = {} as { [key: string]: boolean };
                state.userConfigs.forEach((config) => {
                    const nameList = config.name.split(':');
                    const postId = nameList[nameList.length - 1];
                    if (postId && config.data) isReadMap[postId] = config.data.is_read;
                    else isReadMap[postId] = false;
                });
                return isReadMap;
            }),
        });

        /* Api */
        const initNoticeApiHelper = () => new ApiQueryHelper()
            .setPage(1, NOTICE_ITEM_LIMIT)
            .setMultiSort([{ key: 'options.is_pinned', desc: true }, { key: 'created_at', desc: true }]);
        let noticeApiHelper = initNoticeApiHelper();
        const listNotice = async () => {
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.client.board.post.list({
                    board_id: state.boardId,
                    query: noticeApiHelper.data,
                    domain_id: null,
                    ...(state.hasSystemRole && { user_domain_id: store.state.domain.domainId }),
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
        const listUserConfig = async () => {
            const userConfigApiQuery = new ApiQueryHelper()
                .setFilters([{
                    k: 'user_id',
                    v: store.state.user.userId,
                    o: '=',
                },
                {
                    k: 'name',
                    v: `console:board:${state.boardId}:`,
                    o: '',
                }])
                .setOnly('data', 'user_id');
            try {
                const { results } = await SpaceConnector.client.config.userConfig.list({
                    query: userConfigApiQuery.data,
                });
                state.userConfigs = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.userConfigs = [];
            }
        };

        /* Util */
        const getSearchFilter = () => {
            const filterHelper = new ApiQueryHelper()
                .setPage(1, NOTICE_ITEM_LIMIT)
                .setSort('created_at', true);
            const filter = [] as QueryStoreFilter[];
            if (state.selectedScope !== 'ALL') filter.push({ k: 'scope', v: state.selectedScope, o: '=' });
            if (state.searchText) filter.push({ k: 'title', v: state.searchText, o: '' });
            filterHelper.setFilters(filter);
            return filterHelper;
        };

        /* event */
        const handleToolboxChange = async (options: ToolboxOptions = {}) => {
            state.searchText = options?.searchText;
            if (!state.searchText) {
                noticeApiHelper = initNoticeApiHelper();
            } else {
                noticeApiHelper = getSearchFilter();
            }
            if (state.boardId) await listNotice();
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
                await listNotice();
                await listUserConfig();
            }
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            handleToolboxChange,
            handleClickNotice,
            handlePageChange,
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
