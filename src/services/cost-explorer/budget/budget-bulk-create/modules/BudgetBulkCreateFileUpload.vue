<template>
    <p-pane-layout>
        Upload filled-in template
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';
import {
    reactive, toRefs,
} from 'vue';


export default {
    name: 'BudgetBulkCreateFileUpload',
    components: {
        PPaneLayout,
    },
    setup() {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
};
</script>
