<template>
    <p-pane-layout>
        Download Template
    </p-pane-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';
import { PPaneLayout } from '@spaceone/design-system';

export default {
    name: 'BudgetBulkCreateTemplateDownload',
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
