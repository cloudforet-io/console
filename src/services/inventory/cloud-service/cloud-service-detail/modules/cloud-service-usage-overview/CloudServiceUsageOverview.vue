<template>
    <fragment>
        <p-card class="cloud-service-usage-overview">
            <template #header>
                Usage Overview
                <p-button size="sm" style-type="primary-dark" :outline="true"
                          font-weight="bold" @click="handleClickShowAll"
                >
                    Show All
                </p-button>
            </template>
            <div class="stat-summary">
                <span class="title">Total Server Count</span>
                <span class="value">{{ serverCount }}</span>
            </div>
            <div class="stat-summary">
                <span class="title">Total Allocated vCPUs Count</span>
                <span class="value">{{ allocatedCpuCount }}</span>
            </div>
            <div class="stat-summary">
                <span class="title">Total Allocated Memory Count</span>
                <span class="value">{{ allocatedMemoryCount }}</span>
            </div>
        </p-card>
        <cloud-service-usage-overview-detail-modal v-model="usageOverviewDetailModalVisible" :cloud-service-type-item="cloudServiceTypeItem" />
    </fragment>
</template>

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs,
} from '@vue/composition-api';
import { PButton, PCard } from '@spaceone/design-system';
import CloudServiceUsageOverviewDetailModal
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewDetailModal.vue';
import { CloudServiceTypeItem } from '@/services/inventory/cloud-service/cloud-service-detail/type';

interface Props {
    cloudServiceTypeItem: CloudServiceTypeItem;
}

export default defineComponent<Props>({
    name: 'CloudServiceUsageOverview',
    components: {
        CloudServiceUsageOverviewDetailModal,
        PCard,
        PButton,
    },
    props: {
        cloudServiceTypeItem: {
            type: Object as () => CloudServiceTypeItem,
            required: true,
        },
    },
    setup() {
        const state = reactive({
            serverCount: 0,
            allocatedCpuCount: 0,
            allocatedMemoryCount: 0,
            usageOverviewDetailModalVisible: false,
        });

        const handleClickShowAll = () => {
            state.usageOverviewDetailModalVisible = true;
        };

        return {
            ...toRefs(state),
            handleClickShowAll,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-usage-overview {
    margin: 1rem 0;
}
</style>
