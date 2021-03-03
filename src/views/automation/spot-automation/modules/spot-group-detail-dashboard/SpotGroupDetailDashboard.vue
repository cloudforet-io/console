<template>
    <div class="grid grid-cols-12 gap-4 spot-group-detail-dashboard">
        <spot-group-basic-info />
    </div>
</template>

<script lang="ts">
import SpotGroupBasicInfo
    from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupBasicInfo.vue';

export default {
    name: 'SpotGroupDetailDashboard',
    components: {
        SpotGroupBasicInfo,

    },
    setup(props) {

    },
};
</script>

<style lang="postcss" scoped>
.spot-group-detail-dashboard {
    padding: 1.875rem 1rem;
    .spot-group-basic-info {
        @apply col-span-12;
        height: auto;

        @screen md {
            @apply col-span-6;
            height: 25.25rem;
        }

        @screen lg {
            @apply col-span-4;
            height: 25.25rem;
        }
    }
}
</style>
