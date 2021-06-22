<template>
    <alert-data-table
        class="project-alert"
        :project-id="projectId"
    >
    </alert-data-table>
</template>

<script lang="ts">
import AlertDataTable from '@/views/monitoring/alert-manager/modules/alert-list/AlertDataTable.vue';

export default {
    name: 'ProjectWebhook',
    components: {
        AlertDataTable,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
    },
};
</script>

<style lang="postcss" scoped>
.project-alert::v-deep {
    .p-toolbox-table {
        @apply border-none;
    }
}
</style>
