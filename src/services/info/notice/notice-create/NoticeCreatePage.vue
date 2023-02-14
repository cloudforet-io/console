<template>
    <div class="notice-create-page">
        <p-heading :title="$t('INFO.NOTICE.FORM.CREATE_NOTICE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <notice-form type="CREATE" />
    </div>
</template>

<script lang="ts">
import { PHeading } from '@spaceone/design-system';

import NoticeForm from '@/services/info/notice/modules/NoticeForm.vue';

export default {
    name: 'NoticeCreatePage',
    components: {
        NoticeForm,
        PHeading,
    },
};
</script>
