<template>
    <div>
        <project-member-tab :project-id="id" />
    </div>
</template>

<script lang="ts">
import ProjectMemberTab from '@/services/project/project-detail/project-member/ProjectMemberTab.vue';

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
