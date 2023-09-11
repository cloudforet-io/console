<script lang="ts" setup>
import { PI, PTooltip } from '@spaceone/design-system';
import {
    ref, useSlots,
} from 'vue';
import type { RouteLocationNormalized } from 'vue-router';


import type { HighlightTagType } from '@/store/modules/display/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';

interface Props {
    show?: boolean;
    label: string|undefined;
    to?: RouteLocationNormalized;
    href?: string;
    isDraggable?: boolean;
    higlightTag?: HighlightTagType;
}

const props = withDefaults(defineProps<Props>(), {
    show: true,
    label: '',
    to: () => ({}) as RouteLocationNormalized,
    href: undefined,
    isBeta: false,
    isNew: false,
    isDraggable: false,
    higlightTag: undefined,
});
const emit = defineEmits<{(e: 'navigate'): void}>();
const slots = useSlots();

const labelRef = ref<HTMLElement|null>(null);

const isEllipsisActive = () => {
    if (labelRef.value) {
        return (labelRef.value?.offsetWidth < labelRef.value?.scrollWidth);
    } return false;
};

const handleClickAnchor = (navigateFn, event: Event) => {
    if (!props.href) navigateFn(event);
    emit('navigate');
};

</script>

<template>
    <p-tooltip v-if="show"
               :contents="isEllipsisActive() ? label : undefined"
               position="bottom"
    >
        <router-link v-slot="{ href: toHref, navigate }"
                     :to="href ? {} : to"
                     :href="href"
                     custom
        >
            <span class="gnb-sub-menu">
                <a class="gnb-sub-contents"
                   :href="href ? href : toHref"
                   :target="href ? '_blank' : undefined"
                   @click.stop="handleClickAnchor(navigate, $event)"
                >
                    <div class="contents-left"
                         :class="{ 'is-exist-extra-mark': slots['extra-mark'] }"
                    >
                        <p-i v-if="isDraggable"
                             name="ic_drag-handle"
                             width="1rem"
                             height="1rem"
                             class="drag-icon"
                        />
                        <div ref="labelRef"
                             class="label"
                        >
                            {{ label }}
                        </div>
                        <beta-mark v-if="higlightTag === 'beta'" />
                        <new-mark v-else-if="higlightTag === 'new'" />
                    </div>
                    <div class="contents-right">
                        <slot name="extra-mark" />
                    </div>
                </a>
            </span>
        </router-link>
    </p-tooltip>
</template>

<style lang="postcss" scoped>
.gnb-sub-menu {
    .gnb-sub-contents {
        @apply text-gray-900 rounded flex items-center justify-between;
        position: relative;
        width: 100%;
        height: 2rem;
        font-size: 0.875rem;
        line-height: 1rem;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        padding: 0.5rem;
        &:hover, &:focus {
            @apply bg-violet-100 text-violet-600;
        }
        &selected {
            @apply text-violet-600;
            background-color: unset;
        }
        &:active {
            @apply bg-white;
        }

        .contents-left {
            @apply flex items-center;
            width: 100%;
            .label {
                @apply truncate;
                display: inline-block;
                width: 100%;
                line-height: 1.25;
            }
        }
        .is-exist-extra-mark {
            width: 80%;
        }
    }
}
</style>
