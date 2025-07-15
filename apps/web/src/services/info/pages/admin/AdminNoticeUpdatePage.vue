<script setup lang="ts">
import { PHeading } from '@cloudforet/mirinae';

import NoticeForm from '@/services/info/components/NoticeForm.vue';

const props = withDefaults(defineProps<{
    postId: string;
}>(), {});
</script>

<template>
    <div class="notice-update-page">
        <p-heading class="mb-6"
                   :title="$t('INFO.NOTICE.FORM.EDIT_TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-form type="EDIT"
                     :post-id="props.postId"
        />
    </div>
</template>
