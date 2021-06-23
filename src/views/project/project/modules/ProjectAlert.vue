<template>
    <div class="project-alert">
        <alert-data-table
            :project-id="projectId"
        />
    </div>
</template>

<script lang="ts">
import AlertDataTable from '@/views/monitoring/alert-manager/modules/alert-list/AlertDataTable.vue';

export default {
    name: 'ProjectAlert',
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
        .panel-top-wrapper {
            @apply border-0;
        }
        .p-data-table {
            th:nth-child(8), td:nth-child(8) {
                @apply hidden;
            }
        }
    }
}
</style>
