<script setup lang="ts">
import { onBeforeMount, onUnmounted } from 'vue';

import { PHeading } from '@spaceone/design-system';

import NoticeDetail from '@/services/info/components/NoticeDetail.vue';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';

const props = defineProps<{
    postId: string;
}>();

const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;

onBeforeMount(() => {
    noticeDetailStore.getNoticePost(props.postId);
});
onUnmounted(() => {
    noticeDetailStore.reset();
});
</script>

<template>
    <div>
        <p-heading :title="noticeDetailState.post?.title"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-detail :post-id="props.postId" />
    </div>
</template>
