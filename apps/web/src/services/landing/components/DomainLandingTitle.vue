<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PI, PButton } from '@cloudforet/mirinae';

import { useDomainStore } from '@/store/domain/domain-store';
import { useUserStore } from '@/store/user/user-store';


const domainStore = useDomainStore();
const userStore = useUserStore();
const storeState = reactive({
    domainName: computed<string>(() => domainStore.state.name),
    isDomainAdmin: computed<boolean>(() => userStore.getters.isDomainAdmin),
    language: computed<string|undefined>(() => userStore.state.language),
});

const handleClickStartButton = () => {
    window.open(storeState.language === 'en' ? 'https://cloudforet.io/docs/guides/getting-started/' : `https://cloudforet.io/${storeState.language}/docs/guides/getting-started/`, '_blank');
};
</script>

<template>
    <div class="domain-landing-title">
        <h1 class="welcome-title">
            {{ $t('LADING.DOMAIN.WELCOME_TITLE') }}
        </h1>
        <i18n class="title"
              path="LADING.DOMAIN.TITLE"
        >
            <template #domain_icon>
                <p-i name="ic_three-boxes-with-sparkles"
                     width="2.5rem"
                     height="2.5rem"
                     color="inherit"
                     class="icon"
                />
            </template>
            <template #domain_name>
                <span>{{ storeState.domainName }}</span>
            </template>
            <template #boost_icon>
                <p-i name="ic_arrow-right-up-with-sparkles"
                     width="2.5rem"
                     height="2.5rem"
                     color="inherit"
                     class="icon"
                />
            </template>
        </i18n>
        <p-button v-if="!storeState.isDomainAdmin"
                  style-type="primary"
                  icon-left="ic_rocket-filled"
                  class="start-button"
                  size="lg"
                  @click="handleClickStartButton"
        >
            {{ $t('LADING.DOMAIN.QUICK_GUIDE_BUTTON') }}
        </p-button>
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
        max-width: 60rem;
    }
    .start-button {
        width: 9.25rem;
    }

    @screen tablet {
        .title {
            font-size: 1.5rem;
            line-height: 1.25;
            max-width: 40.5rem;
            .icon {
                width: 2rem !important;
                height: 2rem !important;
            }
        }
    }
}
</style>
