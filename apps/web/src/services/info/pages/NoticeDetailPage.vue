<script setup lang="ts">
import { computed } from 'vue';

import { PHeading } from '@cloudforet/mirinae';

import NoticeDetail from '@/services/info/components/NoticeDetail.vue';
import { usePostGetQuery } from '@/services/info/composables/use-post-get-query';

const props = defineProps<{
    postId: string;
}>();

const postId = computed(() => props.postId);

const { postData } = usePostGetQuery(postId);
</script>

<template>
    <div>
        <p-heading class="mb-6"
                   :title="postData?.title"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-detail :post-id="props.postId" />
    </div>
</template>
