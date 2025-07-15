<script setup lang="ts">
import { PHeading } from '@cloudforet/mirinae';

import NoticeForm from '@/services/info/components/NoticeForm.vue';
</script>

<template>
    <div class="notice-create-page">
        <p-heading class="mb-6"
                   :title="$t('INFO.NOTICE.FORM.CREATE_NOTICE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-form type="CREATE" />
    </div>
</template>
