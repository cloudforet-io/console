<template>
    <cost-dashboard-customize-widget-preview :layout="layout">
        <template #chart>
            <div class="info-item">
                <div class="type">
                    <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.TYPE') }}</p-field-title>
                    <p-anchor highlight
                              :href="thumbnailLink"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.VIEW_PREVIEW') }}
                    </p-anchor>
                </div>
                <div class="image-wrapper">
                    <p-lazy-img :src="assetUrlConverter(chartThumbnail)"
                                width="232px"
                                height="10rem"
                    />
                </div>
            </div>
        </template>
    </cost-dashboard-customize-widget-preview>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PAnchor, PFieldTitle, PLazyImg } from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import CostDashboardCustomizeWidgetPreview
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-customize/modules/CostDashboardCustomizeWidgetPreview.vue';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';


const CONSOLE_ASSETS_S3_PATH = 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/widget';
export default {
    name: 'DefaultWidgetPreview',
    components: {
        CostDashboardCustomizeWidgetPreview,
        PFieldTitle,
        PLazyImg,
        PAnchor,
    },
    setup() {
        const costDashboardPageStore = useCostDashboardPageStore();
        const costDashboardPageState = costDashboardPageStore.state;

        const state = reactive({
            chartThumbnail: computed(() => `${CONSOLE_ASSETS_S3_PATH}/tn--${costDashboardPageState.originSelectedWidget?.options?.chart_img}.png`),
            thumbnailLink: computed(() => `${CONSOLE_ASSETS_S3_PATH}/${costDashboardPageState.originSelectedWidget?.options?.chart_img}.png`),
            chartType: computed(() => costDashboardPageState.originSelectedWidget?.options?.chart_type ?? ''),
            layout: computed(() => costDashboardPageState.originSelectedWidget?.options?.layout),
        });
        return {
            ...toRefs(state),
            assetUrlConverter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 0.5rem;
    .type {
        @apply w-full inline-flex justify-between;
    }
    .p-anchor {
        @apply items-center;
    }
}
.image-wrapper {
    img {
        margin: 0 auto;
    }
}
</style>
