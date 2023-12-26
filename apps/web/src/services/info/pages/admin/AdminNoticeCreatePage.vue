<script setup lang="ts">
import { onUnmounted } from 'vue';

import { PHeading } from '@spaceone/design-system';

import NoticeForm from '@/services/info/components/NoticeForm.vue';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';

const noticeDetailStore = useNoticeDetailStore();
onUnmounted(() => {
    noticeDetailStore.reset();
});
</script>

<template>
    <div class="notice-create-page">
        <p-heading :title="$t('INFO.NOTICE.FORM.CREATE_NOTICE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-form type="CREATE" />
    </div>
</template>
