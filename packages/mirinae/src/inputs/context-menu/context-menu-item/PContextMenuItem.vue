<template>
    <component :is="state.isAnchor ? 'router-link' : 'span'"
               class="p-context-menu-item"
               :class="{selected, disabled, 'is-anchor': state.isAnchor, readonly}"
               v-bind="{...state.routerLinkProps, ...attrs}"
               v-on="listeners"
    >
        <p-i v-if="state.selectIcon"
             class="select-marker"
             :name="state.selectIcon"
             width="1em"
             height="1em"
        />
        <p-i v-if="icon"
             class="left-icon"
             :name="icon"
             :color="iconColor"
             width="1rem"
             height="1rem"
        />
        <p-lazy-img v-if="!icon && imageUrl"
                    class="left-icon"
                    :src="imageUrl"
                    width="1rem"
                    height="1rem"
        />
        <span class="label-wrapper"
              :class="{ellipsis}"
        >
            <p-text-highlighting v-if="highlightTerm && !slots.default"
                                 :text="label"
                                 :term="highlightTerm"
                                 class="text"
                                 style-type="secondary"
            >
                <template #default="textHighlightingSlotProps">
                    <slot name="text-list"
                          v-bind="{...textHighlightingSlotProps, ...props}"
                    />
                </template>
            </p-text-highlighting>
            <span v-else
                  class="text"
            >
                <slot name="default"
                      v-bind="props"
                >
                    {{ label }}
                </slot>
            </span>
            <p-i v-if="link"
                 name="ic_external-link"
                 class="external-link-icon"
                 width="0.875rem"
                 height="0.875rem"
            />
        </span>
    </component>
</template>

<script setup lang="ts">
import {
    computed, reactive, useAttrs, useSlots,
} from 'vue';
import type { RouteLocation } from 'vue-router';

import PTextHighlighting from '@/data-display/text-highlighting/PTextHighlighting.vue';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import PI from '@/foundation/icons/PI.vue';
import type { SelectMarker } from '@/inputs/context-menu/context-menu-item/type';

interface Props {
    name: string;
    label?: string;
    link: string;
    to?: RouteLocation;
    disabled: boolean;
    selected: boolean;
    selectMarker?: SelectMarker;
    ellipsis: boolean;
    highlightTerm: string;
    readonly: boolean;
    icon?: string;
    iconColor?: string;
    imageUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    label: '',
    link: '',
    to: undefined,
    disabled: false,
    selected: false,
    selectMarker: undefined,
    ellipsis: false,
    highlightTerm: '',
    readonly: false,
    icon: undefined,
    iconColor: undefined,
    imageUrl: undefined,
});
const attrs = useAttrs();
const slots = useSlots();

const state = reactive({
    selectIcon: computed<string|undefined>(() => {
        if (props.selectMarker === 'checkbox') {
            if (props.selected) {
                return props.disabled ? 'ic_checkbox-disabled-selected' : 'ic_checkbox-selected';
            }
            return props.disabled ? 'ic_checkbox-disabled' : 'ic_checkbox';
        }
        if (props.selectMarker === 'radio') {
            if (props.disabled) return 'ic_radio-disabled';
            return props.selected ? 'ic_radio-selected' : 'ic_radio';
        }
        return undefined;
    }),
    isAnchor: computed(() => !props.disabled && (props.link || props.to)),
    routerLinkProps: computed(() => {
        if (state.isAnchor) {
            return {
                to: props.to && !props.disabled ? props.to : {},
                href: props.link,
                target: props.link ? '_blank' : undefined,
            };
        }
        return {};
    }),
});

const listeners = {
    ...attrs,
};

</script>

<style lang="postcss">
.p-context-menu-item {
    @apply text-gray-900 text-label-md;
    display: flex;
    padding: 0.5rem;
    cursor: pointer;
    &:not(.disabled) {
        &:hover, &:focus {
            @apply bg-blue-100;
            &.is-anchor {
                > .label-wrapper .text {
                    text-decoration: underline;
                }
            }
        }
    }
    &.disabled {
        @apply text-gray-300;
        cursor: not-allowed;
    }
    &.readonly {
        cursor: not-allowed;
    }
    &.selected:not(.disabled) {
        @apply bg-blue-200;
    }
    > .select-marker {
        flex-shrink: 0;
        margin-right: 0.25rem;
        font-size: 1.25rem;
    }
    > .left-icon {
        margin-right: 0.25rem;
        margin-top: 0.25rem;
        flex-shrink: 0;
    }
    > .label-wrapper {
        flex-grow: 1;
        overflow: hidden;
        line-height: inherit;
        vertical-align: middle;
        &.ellipsis {
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        > .external-link-icon {
            margin-left: 0.25rem;
            line-height: inherit;
        }
    }
}
</style>
