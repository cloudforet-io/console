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
import { onBeforeMount } from 'vue';

import { PHeading } from '@spaceone/design-system';

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
            default: '',
        },
    },
    setup(props) {
        const noticeDetailStore = useNoticeDetailStore();
        const noticeDetailState = noticeDetailStore.state;

        onBeforeMount(async () => {
            if (props.postId === noticeDetailState.post?.post_id) return;
            noticeDetailStore.reset();
            await noticeDetailStore.getNoticePost(props.postId);
        });

        return {
            noticeDetailState,
        };
    },
};
</script>
