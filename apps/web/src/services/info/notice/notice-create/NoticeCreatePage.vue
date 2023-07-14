<script lang="ts" setup>
import { PHeading } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import NoticeForm from '@/services/info/notice/modules/NoticeForm.vue';

const { t } = useI18n();
const router = useRouter();

</script>

<template>
    <div class="notice-create-page">
        <p-heading :title="t('INFO.NOTICE.FORM.CREATE_NOTICE')"
                   show-back-button
                   @click-back-button="router.go(-1)"
        />
        <notice-form type="CREATE" />
    </div>
</template>
