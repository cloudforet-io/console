<script lang="ts" setup>
import { PI, PSelectDropdown } from '@spaceone/design-system';
import type { Editor } from '@tiptap/core';
import {
    reactive,
} from 'vue';


import {
    blue, coral, gray, green, peacock, red, violet, yellow,
} from '@/styles/colors';

const COLOR_PICKER_COLOR_SETS = [
    [gray[900], violet[500], blue[500], peacock[500], green[500], yellow[500], coral[500], red[500]],
    [gray[500], violet[700], blue[700], peacock[700], green[700], yellow[700], coral[700], red[700]],
];

interface Props {
    editor: Editor
}
defineProps<Props>();
const emit = defineEmits<{(e: 'select', value: string): void}>();

const state = reactive({
    textColorItems: COLOR_PICKER_COLOR_SETS.flatMap((color) => ({ name: color })),
});

const handleColorClick = async (color: string) => {
    emit('select', color);
};

</script>

<template>
    <p-select-dropdown class="color-picker"
                       style-type="transparent"
                       :items="state.textColorItems"
                       index-mode
    >
        <template #menu-menu>
            <div class="color-picker-menu">
                <div v-for="(colorSet, idx) in COLOR_PICKER_COLOR_SETS"
                     :key="idx"
                     class="color-picker-set"
                >
                    <span v-for="(color) in colorSet"
                          :key="color"
                          class="color-picker-chip"
                          :style="{color}"
                          @click.stop="handleColorClick(color)"
                    >
                        <span class="chip-fill" />
                        <span class="chip-border" />
                        <p-i v-if="editor.isActive('textStyle', {color})"
                             name="ic_check"
                             class="chip-check-mark"
                             height="1rem"
                             width="1rem"
                             color="white"
                        />

                    </span>
                </div>
            </div>
        </template>
        <p-i name="ic_text-color"
             color="inherit"
        />
    </p-select-dropdown>
</template>

<style lang="postcss" scoped>
.color-picker {
    .color-picker-menu {
        padding: 0.625rem;
    }
    .color-picker-set {
        display: flex;
        &:not(:last-of-type) {
            margin-bottom: 0.5rem;
        }
    }
    .color-picker-chip {
        position: relative;
        display: inline-block;
        height: 24px;
        width: 24px;
        border-radius: 100%;
        cursor: pointer;
        &:not(:last-of-type) {
            margin-right: 0.25rem;
        }
        .chip-fill {
            position: absolute;
            left: 0;
            top: 0;
            height: 24px;
            width: 24px;
            border-radius: 100%;
            background-color: currentColor;
        }
        .chip-border {
            position: absolute;
            left: 0;
            top: 0;
            height: 24px;
            width: 24px;
            border-radius: 100%;
            border-width: 1px;
            border-color: currentColor;
            mix-blend-mode: multiply;
            opacity: 0.7;
        }
        .chip-check-mark {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-55%, -50%);
        }

        @media (hover: hover) {
            &:hover {
                outline: theme('colors.blue.200') solid 2px;
            }
        }
    }
}
</style>
