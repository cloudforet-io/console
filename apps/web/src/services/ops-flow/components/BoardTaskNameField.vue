<script setup lang="ts">
import { PCollapsiblePanel, PLink } from '@cloudforet/mirinae';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';

const props = defineProps<{
    taskId: string;
    name: string;
    linkNewTab?: boolean;
}>();

const { getProperRouteLocation } = useProperRouteLocation();

</script>

<template>
    <p-collapsible-panel class="task-name-field"
                         :line-clamp="1"
    >
        <p-link :text="props.name"
                :to="getProperRouteLocation({
                    name: OPS_FLOW_ROUTE.BOARD.TASK_DETAIL._NAME,
                    params: {taskId: props.taskId},
                })"
                :highlight="!props.linkNewTab"
                :action-icon="props.linkNewTab ? 'internal-link' : 'none'"
                :new-tab="props.linkNewTab"
        />
    </p-collapsible-panel>
</template>

<style scoped lang="postcss">
.task-name-field {
    padding: 0;
}
</style>
