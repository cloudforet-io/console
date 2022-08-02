<template>
    <div class="notice-page">
        notice-page
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'NoticePage',
    setup() {
        const state = reactive({});
        return {
            ...toRefs(state),
        };
    },
};
</script>
