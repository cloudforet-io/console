<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { usePreferencesStore } from '@/store/preferences/preferences-store';

const domainConfigStore = usePreferencesStore();

const route = useRoute();

const state = reactive({
    headingTitle: computed<TranslateResult>(() => i18n.t(route.meta?.translationId)),
});

(async () => {
    await domainConfigStore.fetchPreferences();
})();
</script>

<template>
    <section class="cost-advanced-settings-container">
        <p-heading :title="state.headingTitle" />
        <div class="page-content-wrapper">
            <router-view />
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.cost-advanced-settings-container {
    .page-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
}
</style>
