<template>
    <p-button-modal :visible="proxyVisible" header-title="Default Filter"
                    :disabled="false"
                    size="md"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            Default Filter
            <span v-if="Object.keys(defaultFilter).length">{{ defaultFilter }}</span>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButtonModal } from '@spaceone/design-system';

interface Props {
    visible: boolean;
    defaultFilter: Record<string, string[]>;
}
export default defineComponent<Props>({
    name: 'CostDashboardCreateDefaultFilterModal',
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
        defaultFilter: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: props.visible,
        });
        const handleConfirm = () => {
            emit('update:visible', false);
            emit('confirm');
        };
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
