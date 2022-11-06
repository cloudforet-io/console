<template>
    <p-pane-layout>
        Upload filled-in template
    </p-pane-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import { PPaneLayout } from '@spaceone/design-system';

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
