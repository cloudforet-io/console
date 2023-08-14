<script setup lang="ts">
/** This is a component in the experimental stage.
 * The name and functionality have not been determined yet, and if this selector is used frequently,
 * You will need to communicate with designers when it gets moved to Mirinae.
 * */
import { useElementHover } from '@vueuse/core';
import { computed, ref } from 'vue';

import { PI, useSelect } from '@spaceone/design-system';

import { gray } from '@/styles/colors';

interface Props {
    value?: any;
    selected?: any;
    disabled?: boolean;
    predicate?: (value: any, current: any) => boolean;
    multiSelectable?: boolean;
    icon?: string;
    iconColor?: string;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'change', selectedItem: string, isSelected: boolean): void}>();

const {
    isSelected,
    getSelected,
} = useSelect({
    value: computed(() => props.value),
    selected: computed(() => props.selected),
    predicate: computed(() => props.predicate),
    multiSelectable: computed(() => props.multiSelectable),
});

const selectBox = ref();
const isHovered = useElementHover(selectBox);


/* event */
const handleClick = () => {
    const newSelected = getSelected();
    if (props.multiSelectable) {
        emit('change', newSelected, !isSelected.value);
    } else {
        emit('change', newSelected, true);
    }
};

</script>

<template>
    <button ref="selectBox"
            class="select-box"
            :class="{selected: isSelected}"
            @click="handleClick"
    >
        <p-i v-if="props.icon"
             :name="props.icon"
             :color="(isHovered || isSelected) ? props.iconColor : gray[300]"
             width="1rem"
             height="1rem"
        />
        <slot />
    </button>
</template>

<style lang="postcss" scoped>
.select-box {
    @apply flex items-center justify-center bg-gray-100 text-gray-300 gap-1;
    width: 100%;
    height: 100%;
    padding: 0.5rem;

    &:hover {
        @apply bg-blue-100 text-gray-700;
    }

    &.selected {
        @apply bg-blue-200 text-gray-700;
    }
}
</style>
