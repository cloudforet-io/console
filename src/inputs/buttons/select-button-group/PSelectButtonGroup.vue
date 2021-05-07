<template>
    <div class="p-select-button-group">
        <div class="button-group">
            <button v-for="(button, idx) in formattedButtons"
                    :key="`${button.name}-${idx}`"
                    class="select-button"
                    :class="{ active:selected === button.name }"
                    @click="onClickButton(button.name, idx)"
            >
                {{ button.label }}
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, computed, toRefs,
} from '@vue/composition-api';

import { SelectButtonGroupProps, SelectButtonType } from '@/inputs/buttons/select-button-group/type';

export default {
    name: 'PSelectButtonGroup',
    props: {
        buttons: {
            type: Array,
            default: () => ([]),
        },
        selected: {
            type: String,
            default: '',
        },
    },
    setup(props: SelectButtonGroupProps, context) {
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

        const onClickButton = (name, idx) => {
            if (props.selected !== name) {
                context.emit('update:selected', name);
                context.emit('clickButton', name, idx);
                context.emit(`click-${name}`, name, idx);
            }
        };
        return {
            ...toRefs(state),
            onClickButton,
        };
    },
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
        @apply bg-gray-100 border text-gray-900;
        height: 2rem;
        border-color: rgba(theme('colors.gray.400'), 0.7);
        border-radius: 0.75rem;
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
    }
}
</style>
