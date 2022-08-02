<template>
    <div class="notice-detail-page">
        detail-page
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'NoticeDetailPage',
    setup() {
        const state = reactive({});
        return {
            ...toRefs(state),
        };
    },
};
</script>
