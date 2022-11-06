<template>
    <div class="notice-create-page">
        <p-page-title :title="$t('INFO.NOTICE.FORM.CREATE_NOTICE')"
                      child
                      @goBack="$router.go(-1)"
        />
        <notice-form type="CREATE" />
    </div>
</template>

<script lang="ts">
import { PPageTitle } from '@spaceone/design-system';

import NoticeForm from '@/services/info/notice/modules/NoticeForm.vue';

export default {
    name: 'NoticeCreatePage',
    components: {
        NoticeForm,
        PPageTitle,
    },
};
</script>
