<script setup lang="ts">
import { PButton } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const emit = defineEmits(['update:visible-clone-modal', 'update:visible-pdf-download-overlay']);
const router = useRouter();
const { t } = useI18n();

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
    const routeName = props.dashboardId.startsWith('project') ? DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME : DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME;
    router.push({ name: routeName, params: { dashboardId: props.dashboardId } });
};

</script>

<template>
    <div class="dashboard-control-buttons">
        <p-button icon-left="ic_dashboard-customize"
                  style-type="tertiary"
                  @click="handleClickCustomize"
        >
            {{ t('DASHBOARDS.DETAIL.CUSTOMIZE') }}
        </p-button>
        <!--        <pdf-download-button :title="$t('DASHBOARDS.DETAIL.EXPORT')"-->
        <!--                             @click="handleVisiblePdfDownloadOverlay"-->
        <!--        />-->
        <p-button icon-left="ic_duplicate"
                  style-type="tertiary"
                  @click="handleVisibleCloneModal"
        >
            {{ t('DASHBOARDS.DETAIL.CLONE') }}
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

<style lang="postcss">
.dashboard-control-buttons {
    display: flex;
    gap: 0.75rem;
}
</style>
