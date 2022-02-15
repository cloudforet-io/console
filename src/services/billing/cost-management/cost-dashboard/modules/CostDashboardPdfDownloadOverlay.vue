<template>
    <pdf-download-overlay>
        <cost-dashboard-preview v-if="dashboardId"
                                :dashboard-id="dashboardId"
                                @rendered="handlePreviewRendered"
        />
    </pdf-download-overlay>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';
import PdfDownloadOverlay from '@/common/components/layouts/PdfDownloadOverlay.vue';
import CostDashboardPreview from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardPreview.vue';

export default {
    name: 'CostDashboardPdfDownloadOverlay',
    components: { CostDashboardPreview, PdfDownloadOverlay },
    props: {
        dashboardId: {
            type: String,
            required: true,
        },
    },
    setup() {
        const state = reactive({});

        const handlePreviewRendered = () => {
            console.debug('preview rendered!');
        };
        return {
            ...toRefs(state),
            handlePreviewRendered,
        };
    },
};
</script>
