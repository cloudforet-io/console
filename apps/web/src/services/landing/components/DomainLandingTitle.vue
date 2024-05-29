<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PI } from '@spaceone/design-system';

import { store } from '@/store';

const storeState = reactive({
    domainName: computed<string>(() => store.state.domain.name),
});
</script>

<template>
    <div class="domain-landing-title">
        <h1 class="welcome-title">
            {{ $t('LADING.DOMAIN.WELCOME_TITLE', {'domain_name': storeState.domainName}) }}
        </h1>
        <i18n class="title"
              path="LADING.DOMAIN.TITLE"
        >
            <template #domain_icon>
                <p-i name="ic_three-boxes-with-sparkles"
                     width="2rem"
                     height="2rem"
                     color="inherit"
                />
            </template>
            <template #domain_name>
                <span>{{ storeState.domainName }}</span>
            </template>
            <template #boost_icon>
                <p-i name="ic_arrow-right-up-with-sparkles"
                     width="2rem"
                     height="2rem"
                     color="inherit"
                />
            </template>
        </i18n>
    </div>
</template>

<style lang="postcss" scoped>
.domain-landing-title {
    @apply flex flex-col;
    gap: 1rem;
    .welcome-title {
        @apply text-label-xl;
    }
    .title {
        @apply text-display-lg font-normal;
        max-width: 55rem;
    }
}
</style>
