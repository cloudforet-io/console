<script setup lang="ts">
import { reactive } from 'vue';

import { PI, PToggleButton, PBadge } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

const MULTI_FACTOR_AUTH_ITEMS = [
    {
        id: 'ms',
        icon: 'microsoft',
        title: i18n.t('MY_PAGE.MFA.MS_TITLE'),
        desc: i18n.t('MY_PAGE.MFA.MS_DESC'),
    },
    {
        id: 'email',
        icon: 'ic_notification-protocol_envelope',
        title: i18n.t('MY_PAGE.MFA.EMAIL'),
        desc: i18n.t('MY_PAGE.MFA.EMAIL_DESC'),
    },
];

const state = reactive({
    enableMfa: {
        ms: false,
        email: false,
    },
});
</script>

<template>
    <div class="user-account-multi-factor-auth-items">
        <div v-for="(item, idx) in MULTI_FACTOR_AUTH_ITEMS"
             :key="`${item.id} - ${idx}`"
             class="user-account-multi-factor-auth-item"
        >
            <p-i class="icon"
                 :name="item.icon"
                 height="2rem"
                 width="2rem"
            />
            <div class="title-wrapper">
                <div class="toggle-wrapper">
                    <p-toggle-button :value="state.enableMfa[item.id]" />
                    <p class="title">
                        {{ item.title }}
                    </p>
                    <p-badge style-type="green200"
                             badge-type="subtle"
                             class="badge"
                    >
                        {{ $t('MY_PAGE.MFA.SYNC') }}
                    </p-badge>
                </div>
                <p class="desc">
                    {{ item.desc }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-account-multi-factor-auth-items {
    @apply flex flex-col;
    gap: 1rem;
    .user-account-multi-factor-auth-item {
        @apply flex items-center border border-gray-200;
        padding: 1rem;
        border-radius: 0.375rem;
        gap: 0.375rem;
        .title-wrapper {
            @apply flex flex-col;
            gap: 0.5rem;
            .toggle-wrapper {
                @apply flex items-center;
                gap: 0.5rem;
                .title {
                    @apply text-label-lg font-bold;
                    margin-left: 0.5rem;
                }
            }
            .desc {
                @apply text-label-md text-gray-600;
            }
        }
    }
}
</style>
