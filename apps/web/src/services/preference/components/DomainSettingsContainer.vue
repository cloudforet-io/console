<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PHeading,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useDomainSettingsStore } from '@/store/domain-settings/domain-settings-store';

import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';


const domainConfigStore = useDomainSettingsStore();

const route = useRoute();

const state = reactive({
    headingTitle: computed<TranslateResult>(() => {
        let title: TranslateResult = '';
        if (route.name === makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.DOMAIN_INFORMATION._NAME)) {
            title = i18n.t('IAM.DOMAIN_SETTINGS.DOMAIN_INFORMATION');
        } else if (route.name === makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.APPEARANCE._NAME)) {
            title = i18n.t('IAM.DOMAIN_SETTINGS.APPEARANCE');
        } else if (route.name === makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION._NAME)) {
            title = i18n.t('IAM.DOMAIN_SETTINGS.AUTO_DORMANCY_CONFIGURATION');
        } else if (route.name === makeAdminRouteName(PREFERENCE_ROUTE.DOMAIN_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME)) {
            title = i18n.t('IAM.DOMAIN_SETTINGS.ANOMALY_DETECTION_CONFIGURATION');
        }
        return title;
    }),
});

(async () => {
    await domainConfigStore.fetchDomainSettings();
})();
</script>

<template>
    <section class="admin-domain-settings-container">
        <p-heading :title="state.headingTitle" />
        <div class="page-content-wrapper">
            <router-view />
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.admin-domain-settings-container {
    .page-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
}
</style>
