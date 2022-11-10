<template>
    <router-link
        v-if="show"
        class="gnb-sub-menu"
        :to="to"
    >
        <div class="gnb-sub-contents">
            <div class="contents-left">
                <p-i v-if="isDraggable"
                     name="ic_drag-handle--slim"
                     width="1rem"
                     height="1rem"
                     class="drag-icon"
                />
                <span>{{ label }}</span>
                <beta-mark v-if="isBeta" />
                <new-mark v-if="isNew" />
            </div>
            <div class="contents-right">
                <slot name="extra-mark" />
            </div>
        </div>
    </router-link>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PI } from '@spaceone/design-system';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';

export default {
    name: 'GNBSubMenu',
    components: { NewMark, BetaMark, PI },
    props: {
        show: {
            type: Boolean,
            default: true,
        },
        to: {
            type: Object,
            default: () => ({}),
        },
        label: {
            type: String as PropType<string|undefined|TranslateResult>,
            default: '',
        },
        isBeta: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
        isDraggable: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

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
    }
}
</style>
