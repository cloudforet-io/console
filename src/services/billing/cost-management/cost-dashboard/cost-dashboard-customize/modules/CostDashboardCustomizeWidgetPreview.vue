<template>
    <fragment>
        <slot name="description" />
        <slot name="chart" />
        <slot name="extra" />
    </fragment>
</template>

<script lang="ts">
export default {
    name: 'CostDashboardCustomizeWidgetPreview',
    components: {},

    setup() {
        return {};
    },
};
</script>
