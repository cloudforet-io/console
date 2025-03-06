<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useDomainConfigStore } from '@/store/config/domain-config-store';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';


const domainConfigStore = useDomainConfigStore();

const route = useRoute();

const state = reactive({
    headingTitle: computed<TranslateResult>(() => {
        let title: TranslateResult = '';
        if (route.name === ADMIN_ADVANCED_ROUTE.PREFERENCES.DOMAIN_INFORMATION._NAME) {
            title = i18n.t('IAM.DOMAIN_SETTINGS.DOMAIN_INFORMATION');
        } else if (route.name === ADMIN_ADVANCED_ROUTE.PREFERENCES.APPEARANCE._NAME) {
            title = i18n.t('IAM.DOMAIN_SETTINGS.APPEARANCE');
        }
        return title;
    }),
});

(async () => {
    await domainConfigStore.fetchPreferences();
})();
</script>

<template>
    <section class="admin-preferences-container">
        <p-heading class="mb-6"
                   :title="state.headingTitle"
        />
        <div class="page-content-wrapper">
            <router-view />
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.admin-preferences-container {
    .page-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
}
</style>
