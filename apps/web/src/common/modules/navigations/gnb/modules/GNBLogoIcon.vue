<script setup lang="ts">

import { computed, reactive } from 'vue';

type GNBLogoIconTheme = 'blue'|'yellow'|'gray'|'green'|'coral'|'indigo'|'peacock';
interface Props {
    theme: GNBLogoIconTheme;
    workspaceName: string;
}

const props = withDefaults(defineProps<Props>(), {
    theme: 'blue',
    workspaceName: '',
});

const state = reactive({
    logoText: computed(() => props.workspaceName.slice(0, 1).toUpperCase()),
    isLogoStartsWithEnglish: computed(() => /^[A-Za-z]/.test(state.logoText)),
});

</script>

<template>
    <div :class="{'logo-wrapper': true, [props.theme]: true, 'english-logo': state.isLogoStartsWithEnglish}">
        {{ state.logoText }}
    </div>
</template>

<style lang="postcss" scoped>
.logo-wrapper {
    @apply flex items-center justify-center text-white text-label-xl font-bold;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;

    &.english-logo {
        @apply text-display-md;
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
