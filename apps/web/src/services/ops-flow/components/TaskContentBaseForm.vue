<script setup lang="ts">
import {
    PFieldTitle, PSelectDropdown, PButton, PPaneLayout,
} from '@cloudforet/mirinae';
</script>

<template>
    <p-pane-layout class="py-6 px-4 flex flex-wrap gap-4">
        <div class="base-form-top-wrapper">
            <div class="base-form-field-wrapper">
                <p-field-title size="md"
                               color="gray"
                >
                    Category
                </p-field-title>
                <p-select-dropdown />
            </div>
            <div class="base-form-field-wrapper">
                <p-field-title size="md"
                               color="gray"
                >
                    topic
                </p-field-title>
                <p-select-dropdown />
            </div>
        </div>
        <div class="base-form-top-wrapper">
            <div class="base-form-field-wrapper">
                <p-field-title size="md"
                               color="gray"
                >
                    Status
                </p-field-title>
                <p-select-dropdown />
            </div>
            <div class="base-form-field-wrapper">
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
        </div>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.base-form-top-wrapper {
    @apply flex-1 flex mobile:flex-wrap gap-4;
}
.base-form-field-wrapper {
    @apply flex-1 min-w-40 mobile:min-w-full flex flex-col gap-1;
}
</style>
