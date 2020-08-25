<template>
    <a :href="href" :target="target" class="p-anchor">
        <span class="text">
            <slot v-bind="$props">
                {{ text }}
            </slot>
        </span>
        <slot v-if="showIcon && target === '_blank'" name="icon" v-bind="$props">
            <p-i name="ic_external-link" height="1rem" width="1rem" />
        </slot>
    </a>
</template>

<script lang="ts">
import PI from '@/components/atoms/icons/PI.vue';
import { reactive } from '@vue/composition-api';

export default {
    name: 'PAnchor',
    components: { PI },
    props: {
        text: {
            type: String,
            default: '',
        },
        showIcon: {
            type: Boolean,
            default: true,
        },
        href: {
            type: String,
            default: undefined,
        },
        target: {
            type: String,
            default: '_blank',
        },
    },
    setup(props) {
        const state = reactive({

        });
        return {

        };
    },
};
</script>

<style lang="postcss">
.p-anchor {
    @apply cursor-pointer inline-flex items-center;
    &:hover {
       @apply text-secondary underline;
    }
    .text {
        @apply mr-1;
    }
}
</style>
