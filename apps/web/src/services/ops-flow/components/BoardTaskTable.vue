<script setup lang="ts">
import {
    PPaneLayout, PToolbox, PDataTable, PDivider,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';


const fields: DataTableField[] = [
    {
        name: 'name',
        label: 'Title',
    },
    {
        name: 'description',
        label: 'Description',
    },
    {
        name: 'topic',
        label: 'Topic',
    },
];
</script>

<template>
    <p-pane-layout class="pt-6">
        <div class="px-4 pb-4">
            <p-toolbox class="mb-2" />
            <p-divider />
            <div class="mt-6">
                filters
            </div>
        </div>
        <p-data-table :fields="fields"
                      :items="[]"
        />
    </p-pane-layout>
</template>
