<script setup lang="ts">
import type { Ref } from 'vue';
import { reactive, toRef } from 'vue';

import { APIError } from '@cloudforet/core-lib/space-connector/error';
import {
    PPaneLayout, PHeading, PToggleButton,
} from '@cloudforet/mirinae';


import { useDomainConfigStore } from '@/store/domain/domain-config-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface DomainConfigLandingData {
    enabled: boolean;
}

const domainConfigStore = useDomainConfigStore();
const domainConfigStoreGetters = domainConfigStore.getters;

const landingData = toRef(domainConfigStoreGetters, 'TASK_LANDING') as unknown as Ref<DomainConfigLandingData|undefined>;

const state = reactive({
    enableLandingPage: false,
});

const setInitialLandingData = async () => {
    if (landingData.value?.enabled) {
        state.enableLandingPage = landingData.value.enabled;
        return;
    }
    try {
        const res = await domainConfigStore.get<DomainConfigLandingData>('TASK_LANDING');
        state.enableLandingPage = res.data.enabled ?? false;
    } catch (e) {
        if (e instanceof APIError && e.status === 404) return;
        ErrorHandler.handleError(e);
    }
};

const updateLandingData = async (enabled: boolean) => {
    const prev = state.enableLandingPage;
    state.enableLandingPage = enabled;
    try {
        await domainConfigStore.set<DomainConfigLandingData>('TASK_LANDING', { enabled });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.enableLandingPage = prev;
    }
};

setInitialLandingData();
</script>

<template>
    <p-pane-layout class="p-4">
        <p-heading class="mb-2"
                   title="Enable Landing Page"
                   heading-type="sub"
        />
        <p class="mb-4 text-label-md text-gray-600">
            랜딩페이지를 사용하면 어떻게 되는지 Description
        </p>
        <p-toggle-button show-state-text
                         :value="state.enableLandingPage"
                         @update:value="updateLandingData"
        />
    </p-pane-layout>
</template>
