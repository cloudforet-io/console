<script setup lang="ts">

import { reactive } from 'vue';

import { PCheckboxGroup, PCheckbox } from '@spaceone/design-system';

const state = reactive({
    workspaces: [
        { label: 'Workspace 1', value: 'workspace1' },
        { label: 'Workspace 2', value: 'workspace2' },
        { label: 'Workspace 3', value: 'workspace3' },
    ],
    selectedWorkspaces: [],
});

</script>

<template>
    <p-checkbox-group v-model="state.selectedWorkspaces"
                      direction="vertical"
                      :options="state.workspaces"
    >
        <p-checkbox v-for="workspace in state.workspaces"
                    :key="workspace.value"
                    :label="workspace.label"
                    :value="workspace.value"
        >
            {{ workspace.label }}
        </p-checkbox>
    </p-checkbox-group>
</template>
