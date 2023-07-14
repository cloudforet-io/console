<script setup lang="ts">
import { PHeading } from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useStore } from 'vuex';

import BaseInformation from '@/services/my-page/my-account/user-account/modules/BaseInformation.vue';
import ChangePassword from '@/services/my-page/my-account/user-account/modules/ChangePassword.vue';
import NotificationEmail from '@/services/my-page/my-account/user-account/modules/NotificationEmail.vue';

const store = useStore();
const state = reactive({
    userType: computed(() => store.state.user.backend),
});
</script>

<template>
    <section class="user-account-page">
        <p-heading :title="t('IDENTITY.USER.ACCOUNT.ACCOUNT_N_PROFILE')" />
        <base-information />
        <notification-email v-if="state.userType === 'LOCAL' || state.userType === 'EXTERNAL'" />
        <change-password v-if="state.userType === 'LOCAL'" />
    </section>
</template>
