<template>
    <p-button-modal :visible="proxyVisible"
                    :header-title="header"
                    :scrollable="false"
                    size="lg"
                    @update:visible="handleUpdateVisible"
    />
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButtonModal } from '@spaceone/design-system';
import { CloudServiceTypeItem } from '@/services/inventory/cloud-service/cloud-service-detail/type';

interface Props {
    visible: boolean;
    cloudServiceTypeItem: CloudServiceTypeItem;
}

export default defineComponent<Props>({
    name: 'CloudServiceUsageOverviewDetailModal',
    components: {
        PButtonModal: PButtonModal as any,
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
        cloudServiceTypeItem: {
            type: Object as () => CloudServiceTypeItem,
            required: true,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: props.visible,
            header: computed(() => `Usage Overview of ${props.cloudServiceTypeItem.name}`),
            widgetSchemaList: [] as any[],
            loading: false,
            data: [] as any[],
        });


        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };

        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
        });
        return {
            ...toRefs(state),
            handleUpdateVisible,
        };
    },
});
</script>
