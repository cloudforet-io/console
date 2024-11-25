<script setup lang="ts">
import { ref } from 'vue';

import {
    PFieldGroup, PTextInput, PToggleButton, PCheckbox,
} from '@cloudforet/mirinae';

const isPrimary = ref(false);
</script>

<template>
    <div>
        <div>
            <p-field-group label="Field Name"
                           required
            >
                <p-text-input />
            </p-field-group>
            <slot name="options" />
            <p-field-group label="Show on Ticket Creation"
                           required
            >
                <p>Display this field during task creation</p>
                <p-toggle-button :value.sync="isPrimary"
                                 show-state-text
                                 position="left"
                />
            </p-field-group>
        </div>
        <div>
            <p-checkbox>
                This Field is Required
            </p-checkbox>
        </div>
    </div>
</template>
