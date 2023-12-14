<template>
    <section class="dashboard-viewers-form">
        <p-field-title>{{ $t('DASHBOARDS.CREATE.LABEL_VIEWERS') }}</p-field-title>
        <div class="dashboard-viewers-wrapper">
            <p-radio-group direction="vertical">
                <p-radio
                    :selected="state.isPublicViewer"
                    @change="handleSelectViewer(DASHBOARD_VIEWER.PUBLIC)"
                >
                    {{ $t('DASHBOARDS.CREATE.PUBLIC') }}
                </p-radio>
                <p class="viewer-description public">
                    {{ $t('DASHBOARDS.CREATE.PUBLIC_DESC') }}
                </p>
                <p-radio
                    :selected="!state.isPublicViewer"
                    @change="handleSelectViewer(DASHBOARD_VIEWER.PRIVATE)"
                >
                    <p-i name="ic_lock-filled"
                         width="0.875rem"
                         height="0.875rem"
                         class="mr-1 mb-1 ml-1 gray-500"
                    />
                    <span>{{ $t('DASHBOARDS.CREATE.PRIVATE') }}</span>
                </p-radio>
                <p class="viewer-description">
                    {{ $t('DASHBOARDS.CREATE.PRIVATE_DESC') }}
                </p>
            </p-radio-group>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PFieldTitle, PRadioGroup, PRadio, PI,
} from '@spaceone/design-system';

import { DASHBOARD_VIEWER } from '@/schema/dashboard/_constants/dashboard-constant';
import type { DashboardViewer } from '@/schema/dashboard/_types/dashboard-type';

import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    dashboardViewerType: DashboardViewer;
}
const props = withDefaults(defineProps<Props>(), {
    dashboardViewerType: DASHBOARD_VIEWER.PUBLIC,
});
const emit = defineEmits<{(event: 'update:dashboard-viewer-type', dashboardViewerType: DashboardViewer): void;
}>();
const state = reactive({
    proxyDashboardViewerType: useProxyValue('dashboardViewerType', props, emit),
    isPublicViewer: true,
});

const handleSelectViewer = (viewerType: DashboardViewer) => {
    state.isPublicViewer = viewerType === DASHBOARD_VIEWER.PUBLIC;
    state.proxyDashboardViewerType = viewerType;
};
</script>

<style lang="postcss" scoped>
.dashboard-viewers-form {
    @apply flex flex-col mt-6;
    gap: 0.5rem;
    .dashboard-viewers-wrapper {
        .viewer-description {
            @apply text-xs text-gray-500;
            font-weight: 400;
            margin-left: 1.5rem;
        }
        .public {
            margin-bottom: 0.25rem;
        }
    }
}
</style>
