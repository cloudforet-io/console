<script setup lang="ts">
import {
    PFieldTitle, PSelectDropdown, PButton, PPaneLayout,
} from '@cloudforet/mirinae';

import TaskFieldForm from '@/services/ops-flow/task-field-forms/TaskFieldForm.vue';
</script>

<template>
    <div class="pt-6 px-4 pb-10">
        <p-pane-layout class="py-6 px-4 flex gap-4">
            <div class="flex flex-col gap-1">
                <p-field-title size="md"
                               color="gray"
                >
                    Category
                </p-field-title>
                <p-select-dropdown />
            </div>
            <div class="flex flex-col gap-1">
                <p-field-title size="md"
                               color="gray"
                >
                    topic
                </p-field-title>
                <p-select-dropdown />
            </div>
            <div class="flex flex-col gap-1">
                <p-field-title size="md"
                               color="gray"
                >
                    Status
                </p-field-title>
                <p-select-dropdown />
            </div>
            <div class="flex flex-col gap-1">
                <div class="flex gap-2">
                    <p-field-title size="md"
                                   color="gray"
                    >
                        Assign to
                    </p-field-title>
                    <p-button style-type="tertiary"
                              size="sm"
                    >
                        Assign
                    </p-button>
                </div>
                <span class="text-label-md">wanzargen@zzz.com</span>
            </div>
        </p-pane-layout>
        <task-field-form />
    </div>
</template>
