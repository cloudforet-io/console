<template>
    <div class="notice-update-page">
        update-page
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'NoticeUpdatePage',
    setup() {
        const state = reactive({});
        return {
            ...toRefs(state),
        };
    },
};
</script>
