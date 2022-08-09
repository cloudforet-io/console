<template>
    <div class="notice-create-page">
        <p-page-title title="Create Notice" @go-back="$router.go(-1)" />
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
