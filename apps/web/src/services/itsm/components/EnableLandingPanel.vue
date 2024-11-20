<script setup lang="ts">
import { reactive } from 'vue';

import {
    PPaneLayout, PHeading, PToggleButton,
} from '@cloudforet/mirinae';

const state = reactive({
    enableLandingPage: false,
});
</script>

<template>
    <p-pane-layout class="p-4">
        <p-heading class="mb-2"
                   title="Enable Landing Page"
                   heading-type="sub"
        />
        <p class="mb-4 text-label-md text-gray-600">
            랜딩페이지를 사용하면 어떻게 되는지 Description
        </p>
        <p-toggle-button show-state-text
                         :value.sync="state.enableLandingPage"
        />
    </p-pane-layout>
</template>
