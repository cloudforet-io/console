<template>
    <div class="p-select-button-group">
        <div class="button-group">
            <button v-for="(button, idx) in state.formattedButtons"
                    :key="`${button.name}-${idx}`"
                    class="select-button"
                    :class="[{ active:selected === button.name }, theme]"
                    @click="onClickButton(button.name, idx)"
            >
                <p-i v-if="selected === button.name && theme === 'text'"
                     name="ic_check"
                     width="1rem"
                     height="1rem"
                     :color="secondary"
                />
                <span>{{ button.label }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import {
    reactive, computed,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';
import { SELECT_BUTTON_GROUP_THEME } from '@/inputs/buttons/select-button-group/config';
import type { SelectButtonType, ButtonType } from '@/inputs/buttons/select-button-group/type';

import { secondary } from '@/styles/colors';

const props = defineProps({
    buttons: {
        type: Array as PropType<(SelectButtonType|string)[]>,
        default: () => ([]),
    },
    selected: {
        type: [String, Number],
        default: '',
    },
    theme: {
        type: String as PropType<ButtonType>,
        default: SELECT_BUTTON_GROUP_THEME.default,
        validator(theme: string) {
            return Object.keys(SELECT_BUTTON_GROUP_THEME).includes(theme);
        },
    },
});
const emit = defineEmits<{(e: 'update:selected', name: string): void;
    (e: 'clickButton', name: string, idx: number): void;
    (e: string, name: string, idx: number): void;
}>();

const state = reactive({
    formattedButtons: computed(() => {
        const buttons: SelectButtonType[] = [];
        props.buttons.forEach((value: string|SelectButtonType) => {
            if (typeof value === 'string') {
                buttons.push({ name: value, label: value });
            } else {
                value.label = value.label || value.name;
                buttons.push(value);
            }
        });
        return buttons;
    }),
});

const onClickButton = (name: string, idx: number) => {
    if (props.selected !== name) {
        emit('update:selected', name);
        emit('clickButton', name, idx);
        emit(`click-${name}`, name, idx);
    }
};

</script>

<style lang="postcss">
.p-select-button-group {
    @apply flex flex-wrap;
    .button-group {
        margin-right: -0.5rem;
        margin-bottom: -0.5rem;
    }
    .select-button {
        @apply bg-gray-100 border text-gray-900 rounded-2xl;
        height: 2rem;
        border-color: rgba(theme('colors.gray.400'), 0.7);
        font-size: 0.875rem;
        line-height: 1.6;
        padding-left: 1rem;
        padding-right: 1rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        &:hover {
            @apply bg-gray-200;
        }
        &.active {
            @apply border-transparent bg-gray-700 text-white;
        }
        &.text {
            @apply bg-transparent text-gray-500 border-transparent;
            display: inline-flex;
            align-items: center;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            &:hover {
                @apply bg-transparent;
            }
            &.active {
                @apply text-secondary;
            }
        }
    }
}
</style>
