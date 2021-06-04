<template>
    <div>
        <project-alert-tab
            :project-id="id"
            :is-activated="true"
        />
    </div>
</template>

<script lang="ts">
import ProjectAlertTab from '@/views/project/project/modules/ProjectAlertTab.vue';

export default {
    name: 'ProjectAlertPage',
    components: { ProjectAlertTab },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
};
</script>
