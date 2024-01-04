<script setup lang="ts">
import { reactive } from 'vue';

import { PButtonModal } from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    visible: boolean;
    title: string;
    loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    title: '',
    loading: false,
});

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

const handleClose = () => {
    state.proxyVisible = false;
};
</script>

<template>
    <p-button-modal class="user-management-remove-modal"
                    :header-title="props.title"
                    size="sm"
                    theme-color="alert"
                    fade
                    backdrop
                    :loading="props.loading"
                    :visible="state.proxyVisible"
                    @confirm="emit('confirm')"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-body" />
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.user-management-remove-modal {
    .modal-body {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
}

</style>
