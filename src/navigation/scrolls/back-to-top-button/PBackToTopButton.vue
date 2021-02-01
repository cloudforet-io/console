<template>
    <div
        v-tooltip.right="{content: 'Back to Top', delay: {show: 150}, classes: ['p-tooltip']}"
        :class="returnedClass"
        :style="{margin: margin}"
        class="back-to-top-button"
        @click.stop="goToTop"
    >
        <p-i name="ic_back-to-top"
             width="1.15rem"
             height="1.15rem"
             color="inherit"
        />
    </div>
</template>

<script lang="ts">
import PI from '@/foundation/icons/PI.vue';
import { computed } from '@vue/composition-api';

export default {
    name: 'PBackToTopButton',
    components: { PI },
    props: {
        location: {
            type: String,
            default: 'bottomRight',
        },
        margin: {
            type: String,
            default: '2.5rem 1rem',
        },
        container: {
            type: undefined,
            default: 'body',
        },
    },
    setup(props) {
        const goToTop = () => {
            props.container.scroll({ top: 0, behavior: 'smooth' });
        };

        const returnedClass = computed(() => (
            props.location === 'bottomRight' ? 'p-back-to-top-button bottomRight' : 'p-back-to-top-button topRight'));

        return {
            goToTop,
            returnedClass,
        };
    },
};
</script>

<style lang="postcss">
.back-to-top-button {
    @apply inline-flex justify-center items-center cursor-pointer;
    position: fixed;
    z-index: 5;
    width: 3rem;
    height: 3rem;
    border-radius: 6.25rem;
    background: theme('colors.white');
    border: 1px solid theme('colors.gray.200');
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: theme('colors.gray.700');
    transition:
        color 0.15s ease-in-out,
        background-color 0.15s ease-in-out;
    &.topRight {
        top: 0;
        right: 0;
    }
    &.bottomRight {
        bottom: 0;
        right: 0;
    }
    &[type="button"] { appearance: none; }
    &:hover {
        background: theme('colors.blue.100');
        color: theme('colors.blue.500');
    }
}
</style>
