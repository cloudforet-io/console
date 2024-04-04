<script lang="ts" setup>
import {
    PHeading,
} from '@spaceone/design-system';

import { useDomainSettingsStore } from '@/store/domain-settings/domain-settings-store';

import DomainSettingsBaseInformation from '@/services/preference/components/DomainSettingsBaseInformation.vue';
import DomainSettingsBrandAssets from '@/services/preference/components/DomainSettingsBrandAssets.vue';
import DomainSettingsTimezoneAndLanguage
    from '@/services/preference/components/DomainSettingsTimezoneAndLanguage.vue';


const domainConfigStore = useDomainSettingsStore();

(async () => {
    await domainConfigStore.fetchDomainSettings();
})();
</script>

<template>
    <section class="admin-domain-settings-page">
        <p-heading :title="$t('MENU.ADMINISTRATION_DOMAIN_SETTINGS')" />
        <div class="page-content-wrapper">
            <domain-settings-base-information />
            <domain-settings-brand-assets />
            <domain-settings-timezone-and-language />
        </div>
    </section>
</template>

<style lang="scss" scoped>
.page-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
</style>
