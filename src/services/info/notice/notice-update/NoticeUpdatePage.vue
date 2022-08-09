<template>
    <div class="notice-update-page">
        <p-page-title title="Edit Notice" @go-back="$router.go(-1)" />
        <notice-form type="EDIT" />
    </div>
</template>

<script lang="ts">
import { PPageTitle } from '@spaceone/design-system';

import NoticeForm from '@/services/info/notice/modules/NoticeForm.vue';


export default {
    name: 'NoticeUpdatePage',
    components: {
        NoticeForm,
        PPageTitle,
    },
};
</script>
