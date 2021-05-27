<template>
    <div>
        <project-member-tab :project-id="id" />
    </div>
</template>

<script lang="ts">
import ProjectMemberTab from '@/views/project/project/modules/ProjectMemberTab.vue';

export default {
    name: 'ProjectMemberPage',
    components: { ProjectMemberTab },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
};
</script>
