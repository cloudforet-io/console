<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router/types/router';

import { PDivider } from '@spaceone/design-system';

import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

interface Props {
    to: Location;
}

const props = defineProps<Props>();
const appContextStore = useAppContextStore();

const state = reactive({
    symbolImage: computed<string|undefined>(() => store.getters['domain/domainSymbolImage']),
});

const handleClickLogo = () => {
    if (!props.to) return;
    appContextStore.setGlobalGrantLoading(true);
};


</script>

<template>
    <div class="my-page-gnb-header">
        <component :is="props.to ? 'router-link' : 'div'"
                   class="title-wrapper"
                   :to="props.to"
                   @click.native="handleClickLogo"
        >
            <div class="logo-wrapper">
                <img v-if="state.symbolImage"
                     class="logo-character"
                     :src="state.symbolImage"
                >
                <img v-else
                     class="logo-character"
                     src="/images/logos/spaceone-default-logo.svg"
                >
            </div>
        </component>
        <p-divider class="logo-divider"
                   vertical
        />
        <p class="my-page-text-title">
            {{ $t('MENU.MY_PAGE') }}
        </p>
    </div>
</template>

<style scoped lang="postcss">
.my-page-gnb-header {
    @apply inline-flex items-center w-full;
    max-width: 16.25rem;
    width: 16.25rem;
    padding: 0.625rem 1rem 0.625rem 1.25rem;
    box-shadow: 0.1875rem 0 0.1875rem 0 rgba(81, 83, 100, 0.15);

    @screen tablet {
        width: 3.25rem;
        box-shadow: none;
    }

    .title-wrapper {
        @apply inline-block;

        .logo-wrapper {
            width: 2rem;
            height: 2rem;
            .logo-character {
                display: inline-block;
                width: 2rem;
                height: 2rem;
            }
        }
    }

    .logo-divider {
        margin: 0 0.75rem;
        height: 2rem;

        @screen tablet {
            display: none;
        }
    }
    .my-page-text-title {
        @apply text-label-lg font-bold text-gray-900;

        @screen tablet {
            display: none;
        }
    }
}
</style>
