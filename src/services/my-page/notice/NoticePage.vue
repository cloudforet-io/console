<template>
    <div class="notice-page">
        <!--song-lang-->
        <p-page-title :title="$t('Notice')">
            <template #extra>
                <p-button :outline="true" style-type="primary-dark" icon="ic_plus_bold"
                          @click="handleCreateNotice"
                >
                    <!--song-lang-->
                    {{ $t('Create Notice') }}
                </p-button>
            </template>
        </p-page-title>
        <notice-list :notice-items="noticeItems" :loading="false" />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import {
    PButton, PPageTitle,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { NOTICE_TYPE } from '@/services/my-page/notice/config';
import NoticeList from '@/services/my-page/notice/modules/NoticeList.vue';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

export default {
    name: 'NoticePage',
    components: {
        PPageTitle,
        PButton,
        NoticeList,
    },
    setup() {
        const state = reactive({
            noticeItems: [
                {
                    id: '1',
                    title: 'long title long title long title long title long title long title long title long title long title long title long title long title ',
                    type: 'type1',
                    createdAt: 'createdAt1',
                    noticeType: NOTICE_TYPE.DOMAIN,
                    isNew: true,
                    isPinned: true,
                },
                {
                    id: '2',
                    title: 'title2',
                    type: 'type2',
                    createdAt: 'createdAt2',
                    noticeType: NOTICE_TYPE.SYSTEM,
                },
                {
                    id: '3',
                    title: 'title3',
                    type: 'type3',
                    createdAt: 'createdAt3',
                    noticeType: NOTICE_TYPE.DOMAIN,
                },
            ],
        });

        const handleCreateNotice = () => {
            SpaceRouter.router.push({ name: MY_PAGE_ROUTE.INFO.NOTICE.CREATE._NAME });
        };

        return {
            ...toRefs(state),
            MY_PAGE_ROUTE,
            handleCreateNotice,
        };
    },
};
</script>
