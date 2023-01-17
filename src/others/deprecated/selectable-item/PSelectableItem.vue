<template>
    <div class="item-container"
         :class="{
             active: active,
             [theme]: true,
             disabled: disabled
         }"
         v-on="itemListeners"
    >
        <div v-if="color"
             class="bar"
             :style="{color}"
        />
        <div class="contents">
            <slot name="side"
                  v-bind="$props"
            >
                <p-lazy-img :src="iconUrl"
                            :error-icon="defaultIcon"
                            :width="iconSize"
                            :height="iconSize"
                            class="flex-shrink-0 mr-2"
                />
            </slot>
            <div class="flex-grow overflow-hidden">
                <slot name="contents"
                      v-bind="$props"
                >
                    <slot name="title"
                          v-bind="$props"
                    >
                        <p class="title">
                            {{ title }}
                        </p>
                    </slot>
                    <slot name="contents-bottom"
                          v-bind="$props"
                    />
                </slot>
            </div>
            <slot name="extra"
                  v-bind="$props"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import { themes } from '@/others/deprecated/selectable-item/config';
import type { SelectableItemPropsType } from '@/others/deprecated/selectable-item/type';
import { makeByPassListeners } from '@/utils/composition-helpers';

export default {
    name: 'PSelectableItem',
    components: {
        PLazyImg,
    },
    props: {
        iconUrl: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        active: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        defaultIcon: {
            type: String,
            default: '',
        },
        color: {
            type: String,
            default: '',
        },
        theme: {
            type: String,
            default: 'default',
            validator(theme) {
                return themes.includes(theme);
            },
        },
        iconSize: {
            type: String,
            default: '2rem',
        },
    },
    setup(props: SelectableItemPropsType, { listeners }) {
        const state = reactive({
            itemListeners: computed(() => ({
                ...listeners,
                click(...args) {
                    if (!props.disabled) makeByPassListeners(listeners, 'click', ...args);
                },
            })),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
@define-mixin item-theme $border-color, $hover-bg-color, $active-color, $active-bg-color {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    border-color: $border-color;
    background-color: theme('colors.white');
    cursor: pointer;
    border-width: 1px;
    min-height: 3rem;
    height: 100%;
    .bar {
        @apply rounded-tl-sm rounded-bl-sm;
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        background-color: currentColor;
    }
    .contents {
        @apply flex items-center w-full content-between p-2 overflow-hidden leading-normal;
    }
    &:not(.disabled):hover {
        background-color: $hover-bg-color;
    }
    &.active:not(.disabled) {
        background-color: $active-bg-color;
        color: $active-color;
        border-color: $active-color;
        &:hover {
            background-color: $hover-bg-color;
        }
    }

    .title {
        @apply text-sm;
        color: inherit;
    }
}
.item-container {
    @apply rounded;
    &.default {
        @mixin item-theme transparent, theme('colors.gray.100'), theme('colors.secondary'), theme('colors.blue.200');
    }
    &.card {
        @mixin item-theme theme('colors.gray.200'), theme('colors.blue.200'), theme('colors.secondary'), theme('colors.blue.200');
        border-radius: theme('borderRadius.xs');
        .contents {
            padding: 0.5rem 1rem;
        }
    }
    &.disabled {
        cursor: unset;
        opacity: 0.5;
    }
}

</style>
