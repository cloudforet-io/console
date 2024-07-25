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

import { ADVANCED_ROUTE } from '@/services/advanced/routes/route-constant';


const domainConfigStore = usePreferencesStore();

const route = useRoute();

const state = reactive({
    headingTitle: computed<TranslateResult>(() => {
        let title: TranslateResult = '';
        if (route.name === makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES.DOMAIN_INFORMATION._NAME)) {
            title = i18n.t('IAM.DOMAIN_SETTINGS.DOMAIN_INFORMATION');
        } else if (route.name === makeAdminRouteName(ADVANCED_ROUTE.PREFERENCES.APPEARANCE._NAME)) {
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
        <p-heading :title="state.headingTitle" />
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
