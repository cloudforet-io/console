<script lang="ts" setup>
import {
    PFieldTitle, PRadioGroup, PRadio, PI,
} from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardViewer } from '@/services/dashboards/config';

const emit = defineEmits<{(e: 'update:dashboardViewerType', value: DashboardViewer): void}>();
const { t } = useI18n();

const state = reactive({
    isPublicViewer: true,
});

const handleSelectViewer = (viewerType: DashboardViewer) => {
    state.isPublicViewer = viewerType === DASHBOARD_VIEWER.PUBLIC;
    emit('update:dashboardViewerType', viewerType);
};

</script>

<template>
    <section class="dashboard-viewers-form">
        <p-field-title>{{ t('DASHBOARDS.CREATE.LABEL_VIEWERS') }}</p-field-title>
        <div class="dashboard-viewers-wrapper">
            <p-radio-group direction="vertical">
                <p-radio :selected="state.isPublicViewer"
                         @change="handleSelectViewer(DASHBOARD_VIEWER.PUBLIC)"
                >
                    {{ t('DASHBOARDS.CREATE.PUBLIC') }}
                </p-radio>
                <p class="viewer-description">
                    {{ t('DASHBOARDS.CREATE.PUBLIC_DESC') }}
                </p>
                <div>
                    <p-radio :selected="!state.isPublicViewer"
                             @change="handleSelectViewer(DASHBOARD_VIEWER.PRIVATE)"
                    >
                        <p-i name="ic_lock-filled"
                             width="0.875rem"
                             height="0.875rem"
                             class="mr-1 mb-1 ml-1 gray-500"
                        />
                        <span>{{ t('DASHBOARDS.CREATE.PRIVATE') }}</span>
                    </p-radio>
                    <p class="viewer-description">
                        {{ t('DASHBOARDS.CREATE.PRIVATE_DESC') }}
                    </p>
                </div>
            </p-radio-group>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.dashboard-viewers-form {
    @apply mt-6;
    .dashboard-viewers-wrapper {
        .viewer-description {
            @apply text-xs text-gray-500;
            font-weight: 400;
            margin: 0.25rem 0 0 1.5rem;
        }
    }
}
</style>
