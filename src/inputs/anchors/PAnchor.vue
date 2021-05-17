<template>
    <router-link :to="to || {}" custom>
        <template #default="{href: toHref, route, navigate, isActive, isExactActive }">
            <a class="p-anchor" :class="{disabled, highlight}" :target="target"
               :href="!disabled && toHref || href"
               v-on="anchorListeners"
            >
                <slot name="left-extra" v-bind="$props" />
                <span class="text" :class="{disabled}">
                    <slot v-bind="$props">
                        {{ text }}
                    </slot>
                </span>
                <slot v-if="showIcon || (showIcon && target === '_blank')" name="icon" v-bind="$props">
                    <p-i name="ic_external-link"
                         height="1em" width="1em"
                         color="inherit"
                    />
                </slot>
            </a>
        </template>
    </router-link>
</template>

<script lang="ts">
import PI from '@/foundation/icons/PI.vue';
import { Location } from 'vue-router';
import { makeByPassListeners } from '@/util/composition-helpers';
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
    setup(props: Props, { listeners }) {
        const anchorListeners = {
            ...listeners,
            click(e) {
                e.stopPropagation();
                makeByPassListeners(listeners, 'click', e);
            },
        };

        return { anchorListeners };
    },
});
</script>

<style lang="postcss">
.p-anchor {
    @apply cursor-pointer inline-flex items-center;

    .text {
        margin-right: 2px;
        font-size: inherit;
        color: inherit;
        font-weight: 400;
        white-space: nowrap;
    }
    &.disabled {
        @apply text-gray-400;
        cursor: not-allowed;
    }
    &:not(.disabled).highlight {
        @apply text-secondary;
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
