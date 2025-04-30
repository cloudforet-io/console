<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useDomainConfigStore } from '@/store/config/domain-config-store';

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
    <section class="cost-advanced-settings-page">
        <p-heading class="mb-6"
                   :title="state.headingTitle"
        />
        <advanced-settings-currency-converter />
    </section>
</template>

<style lang="postcss" scoped>
.cost-advanced-settings-page {
    .page-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
}
</style>
