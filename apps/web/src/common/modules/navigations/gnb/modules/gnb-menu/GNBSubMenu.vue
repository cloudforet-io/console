<script setup lang="ts">
import { ref } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Route } from 'vue-router';

import { PI, PTooltip } from '@spaceone/design-system';

import type { HighlightTagType } from '@/store/modules/display/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';

interface Props {
    show?: boolean;
    label: string|undefined|TranslateResult;
    to?: Route;
    href?: string;
    isDraggable?: boolean;
    highlightTag?: HighlightTagType;
}
const props = withDefaults(defineProps<Props>(), {
    show: true,
    label: '',
    to: () => ({} as Route),
    href: undefined,
    isDraggable: false,
    highlightTag: undefined,
});
const emit = defineEmits<{(e: 'navigate'): void;
}>();
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
    <p-tooltip v-if="props.show"
               :contents="isEllipsisActive() ? props.label : undefined"
               position="bottom"
    >
        <router-link class="gnb-sub-menu"
                     :to="props.href ? {} : props.to"
                     custom
        >
            <template #default="{href: toHref, navigate}">
                <span>
                    <a class="gnb-sub-contents"
                       :href="props.href ? props.href : toHref"
                       :target="props.href ? '_blank' : undefined"
                       @click.stop="handleClickAnchor(navigate, $event)"
                    >
                        <div class="contents-left"
                             :class="{ 'is-exist-extra-mark': $slots['extra-mark'] }"
                        >
                            <p-i v-if="props.isDraggable"
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
                            <beta-mark v-if="props.highlightTag === 'beta'" />
                            <new-mark v-else-if="props.highlightTag === 'new'" />
                        </div>
                        <div class="contents-right">
                            <slot name="extra-mark" />
                        </div>
                    </a>
                </span>
            </template>
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

        .contents-right {
            @apply flex items-center;
        }

        .contents-left {
            @apply flex items-center;
            width: auto;
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
