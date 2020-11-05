<template>
    <a :href="href" :target="target" class="p-anchor"
       :class="{highlight}"
    >
        <span class="text">
            <slot v-bind="$props">
                {{ text }}
            </slot>
        </span>
        <slot v-if="showIcon && target === '_blank'" name="icon" v-bind="$props">
            <p-i name="ic_external-link" height="1em" width="1em" />
        </slot>
    </a>
</template>

<script lang="ts">
import PI from '@/components/atoms/icons/PI.vue';
import { AnchorProps } from '@/components/molecules/anchors/type';

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
        highlight: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: AnchorProps) {
        return {

        };
    },
};
</script>

<style lang="postcss">
.p-anchor {
    @apply cursor-pointer inline-flex items-center;
    &:hover {
        @apply underline;
    }
    &.highlight {
        @apply text-secondary;
    }
    .text {
        margin-right: 2px;
    }
}
</style>
