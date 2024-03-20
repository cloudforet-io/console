<script setup lang="ts">

import { reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextEditor,
} from '@spaceone/design-system';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    title: 'Add Custom Metric with Query',
});

const {
    forms: {
        name,
        code,
    },
    // invalidState,
    // invalidTexts,
    // setForm, isAllValid,
} = useFormValidator({
    name: '',
    code: '{}',
}, {
    code: (value: string) => {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    },
});


/* Event */
const handleClose = () => { state.proxyVisible = false; };

</script>

<template>
    <p-button-modal class="add-custom-metric-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="state.title"
                    size="lg"
                    @confirm="handleClose"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-field-group label="name"
                           required
            >
                <p-text-input v-model="name"
                              class="custom-metric-name-input"
                />
            </p-field-group>
            <p-field-group required>
                <p-text-editor :code.sync="code" />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.add-custom-metric-modal {
    .custom-metric-name-input {
        @apply w-full;
    }
}
</style>
