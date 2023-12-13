<template>
    <div class="notice-update-page">
        <p-heading :title="$t('INFO.NOTICE.FORM.EDIT_TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-form type="EDIT" />
    </div>
</template>

<script lang="ts">
import { watch } from 'vue';

import { PHeading } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import NoticeForm from '@/services/info/components/NoticeForm.vue';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';


export default {
    name: 'NoticeUpdatePage',
    components: {
        NoticeForm,
        PHeading,
    },
    props: {
        postId: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        const noticeDetailStore = useNoticeDetailStore();
        const noticeDetailState = noticeDetailStore.state;

        watch(() => noticeDetailState.post, (notice) => {
            if (!notice) return;
            // System can access to every update page
            if (store.getters['user/hasSystemRole']) return;
            // Domain can access to only their update page
            if (
                notice.scope === 'PUBLIC'
                || !(notice.scope === 'DOMAIN' && store.getters['user/hasDomainRole'])
            ) SpaceRouter.router.back();
        });

        return {
            noticeDetailState,
        };
    },
};
</script>
