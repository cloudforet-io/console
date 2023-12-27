<template>
    <section class="user-account-page">
        <p-heading :title="$t('MY_PAGE.ACCOUNT.ACCOUNT_N_PROFILE')" />
        <user-account-base-information />
        <user-account-notification-email v-if="state.smtpEnabled && (state.authType === 'LOCAL' || state.authType === 'EXTERNAL')" />
        <user-account-multi-factor-auth />
        <user-account-change-password v-if="state.authType === 'LOCAL'" />
    </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PHeading } from '@spaceone/design-system';

import { store } from '@/store';

import config from '@/lib/config';

import UserAccountBaseInformation from '@/services/my-page/components/UserAccountBaseInformation.vue';
import UserAccountChangePassword from '@/services/my-page/components/UserAccountChangePassword.vue';
import UserAccountMultiFactorAuth from '@/services/my-page/components/UserAccountMultiFactorAuth.vue';
import UserAccountNotificationEmail from '@/services/my-page/components/UserAccountNotificationEmail.vue';


const state = reactive({
    authType: computed(() => store.state.user.authType),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
});
</script>
