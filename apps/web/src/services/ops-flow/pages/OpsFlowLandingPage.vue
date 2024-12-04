<script setup lang="ts">
import { ref } from 'vue';

import {
    PFieldTitle, PButton, PDivider, PSelectCard, PPaneLayout, PEmpty,
} from '@cloudforet/mirinae';

import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';

const taskCategoryStore = useTaskCategoryStore();
const taskCategoryGetters = taskCategoryStore.getters;
const selected = ref<string|undefined>();
</script>

<template>
    <div class="ops-flow-landing-page">
        <div class="mb-6 text-center text-display-md font-bold">
            Support Center
        </div>
        <div class="max-w-[712px] mx-auto">
            <div class="mb-4 pt-4 flex justify-between">
                <p-field-title label="Active Ticket" />
                <p-button style-type="secondary"
                          size="sm"
                >
                    View All Tickets
                </p-button>
            </div>
            <p-pane-layout class="mb-10 min-h-20 flex items-center justify-center">
                <p-empty>No Active Tickets</p-empty>
            </p-pane-layout>
            <p-divider />
            <div class="mt-10">
                <p class="mb-6 text-display-md">
                    Category
                </p>
                <div class="flex justify-center">
                    <div class="grid grid-cols-2 gap-4 justify-center items-center">
                        <p-select-card v-for="category in taskCategoryGetters.taskCategories"
                                       :key="category.categroy_id"
                                       class="w-[352px] h-[50px] min-h-[50px]"
                                       :value="category.categroy_id"
                                       :label="category.name"
                                       :selected="selected"
                        />
                    </div>
                </div>
            </div>
            <div class="mt-10 flex justify-end">
                <p-button style-type="substitutive"
                          icon-right="ic_arrow-right"
                >
                    Next
                </p-button>
            </div>
        </div>
    </div>
</template>

