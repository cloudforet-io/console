<script setup lang="ts">
import { onBeforeMount } from 'vue';

import { PHeading } from '@spaceone/design-system';

import NoticeForm from '@/services/info/components/NoticeForm.vue';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';

const props = withDefaults(defineProps<{
    postId: string;
}>(), {});
const noticeDetailStore = useNoticeDetailStore();

onBeforeMount(async () => {
    noticeDetailStore.reset();
    await noticeDetailStore.getNoticePost(props.postId);
});
</script>

<template>
    <div class="notice-update-page">
        <p-heading :title="$t('INFO.NOTICE.FORM.EDIT_TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-form type="EDIT" />
    </div>
</template>
