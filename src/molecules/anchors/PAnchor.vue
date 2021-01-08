<template>
    <a :href="!disabled&&href" :target="target"
       class="p-anchor" :class="{disabled}"
    >
        <span class="text" :class="{disabled}">
            <slot v-bind="$props">
                {{ text }}
            </slot>
        </span>
        <slot v-if="showIcon && target === '_blank'" name="icon" v-bind="$props">
            <p-i name="ic_external-link"
                 height="1em" width="1em"
                 color="inherit"
            />
        </slot>
    </a>
</template>

<script lang="ts">
import PI from '@/atoms/icons/PI.vue';

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
        disabled: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="postcss">
.p-anchor {
    @apply cursor-pointer inline-flex items-center;

    .text {
        margin-right: 2px;
        font-size: inherit;
        color: inherit;
        font-weight: 400;
    }
    &.disabled {
        @apply text-gray-400;
        cursor: not-allowed;
    }
    &:hover {
        .text {
          @apply underline;
        }
        .disabled {
            text-decoration: none;
        }
    }
}
</style>
