<template>
    <div class="notice-create-page">
        create-page
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'NoticeCreatePage',
    setup() {
        const state = reactive({});
        return {
            ...toRefs(state),
        };
    },
};
</script>
