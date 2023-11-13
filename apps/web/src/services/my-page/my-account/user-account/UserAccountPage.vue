<template>
    <section class="user-account-page">
        <p-heading :title="$t('IDENTITY.USER.ACCOUNT.ACCOUNT_N_PROFILE')" />
        <base-information />
        <notification-email v-if="state.smtpEnabled && (state.userType === 'LOCAL' || state.userType === 'EXTERNAL')" />
        <multi-factor-authentication />
        <change-password v-if="state.userType === 'LOCAL'" />
    </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PHeading } from '@spaceone/design-system';

import { store } from '@/store';

import config from '@/lib/config';

import BaseInformation from '@/services/my-page/my-account/user-account/modules/BaseInformation.vue';
import ChangePassword from '@/services/my-page/my-account/user-account/modules/ChangePassword.vue';
import MultiFactorAuthentication
    from '@/services/my-page/my-account/user-account/modules/MultiFactorAuthentication.vue';
import NotificationEmail from '@/services/my-page/my-account/user-account/modules/NotificationEmail.vue';


const state = reactive({
    userType: computed(() => store.state.user.backend),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
});
</script>
