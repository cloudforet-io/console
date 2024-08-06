<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router/types/router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDomainStore } from '@/store/domain/domain-store';

interface Props {
    to: Location;
}

const props = defineProps<Props>();
const appContextStore = useAppContextStore();
const domainStore = useDomainStore();
const state = reactive({
    symbolImage: computed<string|undefined>(() => domainStore.getters.domainSymbolImage),
});

const handleClickLogo = () => {
    if (!props.to) return;
    appContextStore.setGlobalGrantLoading(true);
};


</script>

<template>
    <div class="my-page-top-bar-header">
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
        <p class="my-page-text-title">
            {{ $t('MENU.MY_PAGE') }}
        </p>
    </div>
</template>

<style scoped lang="postcss">
.my-page-top-bar-header {
    @apply inline-flex items-center;
    padding-left: 0.875rem;
    gap: 0.75rem;

    .title-wrapper {
        @apply inline-block;

        .logo-wrapper {
            width: 1.75rem;
            height: 1.75rem;
            .logo-character {
                display: inline-block;
                width: 1.75rem;
                height: 1.75rem;
            }
        }
    }
    .my-page-text-title {
        @apply text-label-lg font-medium text-gray-900;
        flex: 1;
    }
}
</style>
