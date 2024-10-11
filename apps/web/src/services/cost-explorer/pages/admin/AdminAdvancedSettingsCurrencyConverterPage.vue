<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PPaneLayout,
} from '@cloudforet/mirinae';

import { store } from '@/store';

import { useDomainStore } from '@/store/domain/domain-store';
// import { usePreferencesStore } from '@/store/preferences/preferences-store';

import type { PageAccessMap } from '@/lib/access-control/config';

// const domainConfigStore = usePreferencesStore();
// const domainConfigGetters = domainConfigStore.getters;
const domainStore = useDomainStore();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const storeState = reactive({
    domainId: computed<string>(() => domainStore.state.domainId),
    domainName: computed<string>(() => domainStore.state.name),
    domainConfig: computed(() => domainStore.state.config),
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
});

</script>

<template>
    <p-pane-layout class="admin-domain-settings-anomaly-detection-configuration-page">
        <div class="content-wrapper">
            currency converter
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.admin-domain-settings-anomaly-detection-configuration-page {
    .content-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
        padding: 1.5rem 1rem;
    }
}
</style>
