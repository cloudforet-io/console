<template>
    <section class="dashboard-viewers-form">
        <p-field-title>{{ $t('DASHBOARDS.CREATE.LABEL_VIEWERS') }}</p-field-title>
        <div class="dashboard-viewers-wrapper">
            <p-radio-group direction="vertical">
                <div>
                    <p-radio
                        :selected="isPublicViewer"
                        @change="handleSelectViewer(DASHBOARD_VIEWER.PUBLIC)"
                    >
                        {{ $t('DASHBOARDS.CREATE.PUBLIC') }}
                    </p-radio>
                    <p class="viewer-description">
                        {{ $t('DASHBOARDS.CREATE.PUBLIC_DESC') }}
                    </p>
                </div>
                <div>
                    <p-radio
                        :selected="!isPublicViewer"
                        @change="handleSelectViewer(DASHBOARD_VIEWER.PRIVATE)"
                    >
                        <p-i name="ic_lock-filled"
                             width="0.875rem"
                             height="0.875rem"
                             class="mr-1 mb-1 ml-1"
                        />
                        {{ $t('DASHBOARDS.CREATE.PRIVATE') }}
                    </p-radio>
                    <p class="viewer-description">
                        {{ $t('DASHBOARDS.CREATE.PRIVATE_DESC') }}
                    </p>
                </div>
            </p-radio-group>
        </div>
    </section>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import { reactive, toRefs } from 'vue';

import {
    PFieldTitle, PRadioGroup, PRadio, PI,
} from '@spaceone/design-system';

import { DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardViewer } from '@/services/dashboards/config';

export default {
    name: 'DashboardViewerForm',
    components: {
        PFieldTitle,
        PRadioGroup,
        PRadio,
        PI,
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            isPublicViewer: true,
        });

        const handleSelectViewer = (viewerType: DashboardViewer) => {
            state.isPublicViewer = viewerType === DASHBOARD_VIEWER.PUBLIC;
            emit('update:dashboardViewerType', viewerType);
        };

        return {
            ...toRefs(state),
            DASHBOARD_VIEWER,
            handleSelectViewer,
        };
    },
};
</script>

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
