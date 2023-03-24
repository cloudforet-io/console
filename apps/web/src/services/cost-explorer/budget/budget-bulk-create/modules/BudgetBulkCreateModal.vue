<template>
    <p-button-modal :visible="proxyVisible"
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

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import { PButtonModal } from '@spaceone/design-system';

interface Props {
    visible: boolean;
}

export default defineComponent<Props>({
    name: 'BudgetBulkCreateModal',
    components: {
        PButtonModal,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
    },
    setup(props, { emit }) {
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

        return {
            ...toRefs(state),
            handleConfirm,
            handleUpdateVisible,
        };
    },
});
</script>
