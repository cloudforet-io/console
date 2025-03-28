<script setup lang="ts">
import { PCollapsiblePanel, PLink } from '@cloudforet/mirinae';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';

const props = defineProps<{
    workspaceId: string;
    taskId: string;
    name: string;
    linkNewTab?: boolean;
}>();

</script>

<template>
    <p-collapsible-panel class="task-name-field"
                         :line-clamp="1"
                         :enable-deep-clamp="true"
    >
        <p-link :text="props.name"
                :to="{
                    name: OPS_FLOW_ROUTE.BOARD.TASK_DETAIL._NAME,
                    params: {
                        workspaceId: props.workspaceId,
                        taskId: props.taskId,
                    },
                }"
                class="leading-lg"
                :highlight="!props.linkNewTab"
                :action-icon="props.linkNewTab ? 'internal-link' : 'none'"
                :new-tab="props.linkNewTab"
                line-height="1.25"
        />
    </p-collapsible-panel>
</template>

<style scoped lang="postcss">
.task-name-field {
    padding: 0;
}
</style>
