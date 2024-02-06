<script setup lang="ts">

import { computed, reactive } from 'vue';

import type { GNBLogoIconTheme } from '@/common/modules/navigations/gnb/types/type';

interface Props {
    theme?: GNBLogoIconTheme;
    text: string;
    size?: 'xs'|'sm'|'md';
}

const props = withDefaults(defineProps<Props>(), {
    theme: 'blue',
    text: '',
    size: 'sm',
});

const state = reactive({
    theme: computed(() => props.theme),
    logoText: computed(() => props.text.slice(0, 1).toUpperCase()),
    isLogoStartsWithEnglish: computed(() => /^[A-Za-z]/.test(state.logoText)),
});

</script>

<template>
    <div :class="{'workspace-logo-icon': true, [state.theme]: true, 'english-logo': state.isLogoStartsWithEnglish, [props.size]: true}">
        {{ state.logoText }}
    </div>
</template>

<style lang="postcss" scoped>
.workspace-logo-icon {
    @apply flex items-center justify-center text-white  font-bold;
    border-radius: 0.375rem;
    &.xs {
        @apply text-label-sm;
        width: 1.25rem;
        height: 1.25rem;
        &.english-logo {
            @apply text-label-sm;
        }
    }
    &.sm {
        @apply text-label-xl;
        width: 2rem;
        height: 2rem;
    }
    &.english-logo {
        @apply text-display-md;
    }
    &.md {
        @apply text-display-lg;
        width: 3rem;
        height: 3rem;
    }
}
.blue {
    background: linear-gradient(180deg, theme('colors.blue.600') 0%, theme('colors.blue.700') 100%);
}
.yellow {
    background: linear-gradient(180deg, theme('colors.yellow.600') 0%, theme('colors.yellow.700') 100%);
}
.gray {
    background: linear-gradient(180deg, theme('colors.gray.600') 0%, theme('colors.gray.700') 100%);
}
.green {
    background: linear-gradient(180deg, theme('colors.green.600') 0%, theme('colors.green.700') 100%);
}
.coral {
    background: linear-gradient(180deg, theme('colors.coral.600') 0%, theme('colors.coral.700') 100%);
}
.indigo {
    background: linear-gradient(180deg, theme('colors.indigo.600') 0%, theme('colors.indigo.700') 100%);
}
.peacock {
    background: linear-gradient(180deg, theme('colors.peacock.600') 0%, theme('colors.peacock.700') 100%);
}
</style>
