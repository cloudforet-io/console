<template>
    <div class="p-select-card"
         :class="{selected: isSelected, block, disabled}"
         :tabindex="tabIndex"
         @click="handleClick"
         v-on="listeners"
         @keydown="handleKeydown"
    >
        <p-i :name="state.markerIconName"
             class="marker"
             width="1.25rem"
             height="1.25rem"
        />
        <div class="contents">
            <slot v-bind="{isSelected}">
                <p-lazy-img v-if="imageUrl || icon"
                            :src="imageUrl"
                            :error-icon="state.errorIcon"
                            :error-icon-color="typeof icon === 'boolean' && icon ? 'inherit' : iconColor"
                            :width="block ? '1rem' : '3rem'"
                            :height="block ? '1rem' : '3rem'"
                />
                <span v-if="label"
                      class="label"
                >{{ label }}</span>
            </slot>
            <slot name="bottom" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive, useAttrs,
} from 'vue';

import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import PI from '@/foundation/icons/PI.vue';
import type { SelectProps } from '@/hooks/select';
import { useSelect } from '@/hooks/select';


interface Props extends SelectProps {
    block?: boolean;
    imageUrl?: string;
    icon?: string|boolean;
    iconColor?: string;
    label?: string;
    tabIndex?: number|undefined;
}
// FIXME:: tabIndex should be a required member;

const props = withDefaults(defineProps<Props>(), {
    value: true,
    disabled: false,
    multiSelectable: false,
    block: false,
    imageUrl: undefined,
    icon: undefined,
    iconColor: '',
    label: '',
    tabIndex: undefined,
});
const emit = defineEmits(['change']);
const attrs = useAttrs();

const {
    isSelected,
    getSelected,
} = useSelect({
    value: computed(() => props.value),
    selected: computed(() => props.selected),
    predicate: computed(() => props.predicate),
    disabled: computed(() => props.disabled),
    multiSelectable: computed(() => props.multiSelectable),
});

const state = reactive({
    markerIconName: computed(() => {
        if (props.multiSelectable) {
            if (props.disabled) return 'ic_checkbox-disabled';
            if (isSelected.value) return 'ic_checkbox-selected';
            return 'ic_checkbox';
        }
        if (props.disabled) return 'ic_radio-disabled';
        if (isSelected.value) return 'ic_checkbox-circle-selected';
        return '';
    }),
    errorIcon: computed(() => {
        if (typeof props.icon === 'string') return props.icon;
        if (props.icon) return 'ic_face-smile';
        return '';
    }),
});

/* event */
const handleClick = () => {
    const newSelected = getSelected();
    if (props.multiSelectable) {
        emit('change', newSelected, !isSelected.value);
    } else {
        emit('change', newSelected, true);
    }
};

// FIXME:: Modularize keyboard event
const handleKeydown = (e: KeyboardEvent) => {
    if (typeof props.tabIndex !== 'number'
                || !e.key.includes('Arrow')
                || props.multiSelectable
    ) return;

    // sibling means other cards on the same depth
    const siblings = (e?.target as HTMLDivElement)?.parentElement?.children as HTMLCollectionOf<HTMLDivElement>;
    const lastIndex = siblings.length - 1;

    let nextTarget = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (props.tabIndex === lastIndex) nextTarget = 0;
        else nextTarget = props.tabIndex + 1;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (props.tabIndex === 0) nextTarget = lastIndex;
        else nextTarget = props.tabIndex - 1;
    }

    siblings[nextTarget].focus();
    siblings[nextTarget].click();
};

const listeners = {
    ...attrs,
};

</script>

<style lang="postcss">
.p-select-card {
    @apply bg-white border-gray-200 text-gray-900 rounded;
    display: inline-block;
    position: relative;
    border-width: 1px;
    padding: 2rem 0.5rem;
    cursor: pointer;
    z-index: 0;
    min-width: 3rem;
    min-height: 3rem;
    &.block {
        display: block;
        width: 100%;
        .contents {
            flex-direction: row;
            .p-lazy-img {
                margin-right: 0.25rem;
                margin-bottom: 0;
            }
        }
    }
    &.selected {
        @apply border-secondary text-secondary;
    }
    &.disabled {
        @apply border-gray-200 text-gray-400;
        cursor: not-allowed;
    }
    .marker {
        @apply absolute;
        left: 0.75rem;
        top: 0.75rem;
        z-index: 1;
    }
    .contents {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;

        .p-lazy-img {
            @apply text-gray-200;
            margin-right: 0;
            margin-bottom: 1rem;
            flex-shrink: 0;
        }

        .label {
            color: inherit;
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.2;
            text-align: center;
            word-break: break-word;
        }
    }

    @media (hover: hover) {
        &:hover:not(.disabled) {
            @apply bg-secondary2;
        }
    }
}
</style>
