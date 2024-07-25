<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { usePreferencesStore } from '@/store/preferences/preferences-store';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


const domainConfigStore = usePreferencesStore();

const route = useRoute();

const state = reactive({
    headingTitle: computed<TranslateResult>(() => {
        let title: TranslateResult = '';
        if (route.name === makeAdminRouteName(COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME)) {
            title = i18n.t('COST_EXPLORER.ANOMALY_DETECTION_CONFIGURATION');
        }
        return title;
    }),
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
