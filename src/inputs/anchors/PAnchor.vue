<template>
    <router-link :to="to || {}" class="p-anchor" custom
                 :class="{disabled, highlight}"
    >
        <template #default="{href: toHref, navigate}">
            <a class="p-anchor" :class="{disabled, highlight}"
               :target="target"
               :href="to ? (toHref || href ): href"
               @click.stop="navigate"
            >
                <slot name="left-extra" v-bind="{...$props, href: to ? (toHref || href ): href}" />
                <span class="text" :class="{disabled}">
                    <slot v-bind="{...$props}">
                        {{ text }}
                    </slot>
                </span>
                <slot v-if="showIcon || (showIcon && target === '_blank')" name="icon"
                      v-bind="{...$props, href: to ? (toHref || href ): href}"
                >
                    <p-i name="ic_external-link"
                         height="1em" width="1em"
                         color="inherit"
                         class="external-icon"
                    />
                </slot>
            </a>
        </template>
    </router-link>
</template>

<script lang="ts">
import PI from '@/foundation/icons/PI.vue';
import { Location } from 'vue-router';
import { defineComponent } from '@vue/composition-api';


interface Props {
  text?: string;
  showIcon?: boolean;
  href?: string;
  to?: Location;
  target?: string;
  highlight?: boolean;
}

export default defineComponent<Props>({
    name: 'PAnchor',
    components: {
        PI,
    },
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
        to: {
            type: Object,
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
        highlight: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<style lang="postcss">
.p-anchor {
    @apply cursor-pointer inline-block;
    vertical-align: middle;
    line-height: inherit;
    .text {
        font-weight: inherit;
        font-size: inherit;
        color: inherit;
        word-break: break-all;
    }
    .external-icon {
        margin-left: 2px;
    }
    &.disabled {
        @apply text-gray-400;
        cursor: not-allowed;
    }
    &:not(.disabled).highlight {
        @apply text-secondary;
    }

    @media (hover: hover) {
        &:hover {
            .text {
                @apply underline;
            }
            .disabled {
                text-decoration: none;
            }
        }
    }

    &:focus, &:active, &focus-within {
        .text {
            @apply underline;
        }
    }
}
</style>
