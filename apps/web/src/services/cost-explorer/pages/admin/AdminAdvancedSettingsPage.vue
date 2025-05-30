<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useDomainConfigStore } from '@/store/config/domain-config-store';

import AdvancedSettingsCostReportConfiguration from '@/services/cost-explorer/components/AdvancedSettingsCostReportConfiguration.vue';
import AdvancedSettingsCurrencyConverter from '@/services/cost-explorer/components/AdvancedSettingsCurrencyConverter.vue';

const domainConfigStore = useDomainConfigStore();

const route = useRoute();

const state = reactive({
    headingTitle: computed<TranslateResult>(() => i18n.t(route.meta?.translationId)),
});

(async () => {
    await domainConfigStore.fetchPreferences();
})();
</script>

<template>
    <section class="admin-cost-advanced-settings-configuration">
        <p-heading class="mb-6"
                   :title="state.headingTitle"
        />
        <div class="page-content-wrapper">
            <advanced-settings-currency-converter />
            <advanced-settings-cost-report-configuration />
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.admin-cost-advanced-settings-configuration {
    .page-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
}
</style>
