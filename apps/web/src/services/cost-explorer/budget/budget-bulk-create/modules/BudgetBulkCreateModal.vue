<script lang="ts" setup>
import { PButtonModal } from '@spaceone/design-system';
import {
    reactive, watch,
} from 'vue';

interface Props {
    visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const state = reactive({
    proxyVisible: props.visible,
});

const handleConfirm = () => {};

const handleUpdateVisible = (visible) => {
    state.proxyVisible = visible;
    emit('update:visible', visible);
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
});

</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    header-title="Bulk Create Budget"
                    :disabled="false"
                    size="lg"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            Budget Bulk Create Modal
        </template>
    </p-button-modal>
</template>
