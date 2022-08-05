<template>
    <div class="notice-page">
        <!--song-lang-->
        <p-page-title :title="$t('Notice')">
            <template #extra>
                <p-button :outline="true" style-type="primary-dark" icon="ic_plus_bold">
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

import { NOTICE_TYPE } from '@/services/my-page/notice/config';
import NoticeList from '@/services/my-page/notice/modules/NoticeList.vue';

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
                    title: 'long title long title long title long title long title long title long title long title long title long title long title long title ',
                    type: 'type1',
                    createdAt: 'createdAt1',
                    noticeType: NOTICE_TYPE.DOMAIN,
                    isNew: true,
                    isPinned: true,
                },
                {
                    title: 'title2',
                    type: 'type2',
                    createdAt: 'createdAt2',
                    noticeType: NOTICE_TYPE.SYSTEM,
                },
                {
                    title: 'title3',
                    type: 'type3',
                    createdAt: 'createdAt3',
                    noticeType: NOTICE_TYPE.DOMAIN,
                },
            ],
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
