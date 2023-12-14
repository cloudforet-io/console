<template>
    <section class="dashboard-viewers-form">
        <p-field-title>{{ $t('DASHBOARDS.CREATE.LABEL_VIEWERS') }}</p-field-title>
        <div class="dashboard-viewers-wrapper">
            <p-radio-group direction="vertical">
                <p-radio
                    :selected="state.isPublic"
                    @change="handleSelectDashboardType('PUBLIC')"
                >
                    {{ $t('DASHBOARDS.CREATE.PUBLIC') }}
                </p-radio>
                <p class="viewer-description public">
                    {{ $t('DASHBOARDS.CREATE.PUBLIC_DESC') }}
                </p>
                <p-radio
                    :selected="!state.isPublic"
                    @change="handleSelectDashboardType('PRIVATE')"
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

import type { DashboardType } from '@/schema/dashboard/_types/dashboard-type';

import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    dashboardType?: DashboardType;
}
const props = withDefaults(defineProps<Props>(), {
    dashboardType: 'PUBLIC',
});
const emit = defineEmits<{(event: 'update:dashboard-type', dashboardType: DashboardType): void;
}>();
const state = reactive({
    proxyDashboardType: useProxyValue('dashboardType', props, emit),
    isPublic: true,
});

const handleSelectDashboardType = (dashboardType: DashboardType) => {
    state.isPublic = dashboardType === 'PUBLIC';
    state.proxyDashboardType = dashboardType;
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
