<template>
    <div class="dashboard-control-buttons">
        <p-button icon-left="ic_decorate"
                  style-type="tertiary"
                  @click="$router.push({ name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME })"
        >
            {{ $t('DASHBOARDS.DETAIL.CUSTOMIZE') }}
        </p-button>
        <p-button icon-left="ic_download"
                  style-type="tertiary"
        >
            {{ $t('DASHBOARDS.DETAIL.EXPORT') }}
        </p-button>
        <p-button icon-left="ic_duplicate"
                  style-type="tertiary"
                  @click="handleVisibleCloneModal"
        >
            {{ $t('DASHBOARDS.DETAIL.CLONE') }}
        </p-button>
    </div>
</template>

<script setup lang="ts">
import { PButton } from '@spaceone/design-system';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const emit = defineEmits(['update:visible-clone-modal']);

const handleVisibleCloneModal = () => {
    emit('update:visible-clone-modal');
};
</script>

<style lang="postcss">
.dashboard-control-buttons {
    display: flex;
    gap: 0.75rem;
}
</style>
