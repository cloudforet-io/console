<template>
    <div class="notice-page">
        <p-heading :title="$t('INFO.NOTICE.MAIN.NOTICE_TITLE')" />
        <notice-list />
    </div>
</template>

<script setup lang="ts">

import {
    PHeading,
} from '@spaceone/design-system';

import NoticeList from '@/services/info/components/NoticeList.vue';

</script>
