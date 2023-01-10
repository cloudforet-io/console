<template>
    <div class="dashboard-control-buttons">
        <p-button icon-left="dashboard-customize"
                  style-type="tertiary"
                  @click="handleClickCustomize"
        >
            {{ $t('DASHBOARDS.DETAIL.CUSTOMIZE') }}
        </p-button>
        <!--        <pdf-download-button :title="$t('DASHBOARDS.DETAIL.EXPORT')"-->
        <!--                             @click="handleVisiblePdfDownloadOverlay"-->
        <!--        />-->
        <p-button icon-left="ic_duplicate"
                  style-type="tertiary"
                  @click="handleVisibleCloneModal"
        >
            {{ $t('DASHBOARDS.DETAIL.CLONE') }}
        </p-button>
        <!--        <pdf-download-overlay v-model="state.visiblePdfDownload"-->
        <!--                              :items="state.previewItems"-->
        <!--                              :file-name="state.pdfFileName"-->
        <!--        >-->
        <!--            <dashboard-detail-preview v-if="props.dashboardId"-->
        <!--                                      :dashboard-id="props.dashboardId"-->
        <!--                                      @rendered="handlePreviewRendered"-->
        <!--            />-->
        <!--        </pdf-download-overlay>-->
    </div>
</template>

<script setup lang="ts">

import { PButton } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';


import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const emit = defineEmits(['update:visible-clone-modal', 'update:visible-pdf-download-overlay']);

const handleVisibleCloneModal = () => {
    emit('update:visible-clone-modal');
};

const props = defineProps<{
    dashboardId: string;
    name?: string;
}>();

// const state = reactive({
//     visiblePdfDownload: false,
//     previewItems: [] as Item[],
//     pdfFileName: computed<string>(() => `${props.name ?? 'Cost_Dashboard'}_${dayjs().format('YYYYMMDD')}`),
// });

// const handlePreviewRendered = (elements) => {
//     state.previewItems = elements.map((element) => ({ element: (element?.$el ?? element), type: 'image' } as Item));
// };

// const handleVisiblePdfDownloadOverlay = () => {
//     state.visiblePdfDownload = true;
// };

const handleClickCustomize = () => {
    SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME, params: { dashboardId: props.dashboardId } });
};

</script>

<style lang="postcss">
.dashboard-control-buttons {
    display: flex;
    gap: 0.75rem;
}
</style>
