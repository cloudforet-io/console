<template>
    <toggle-button
        v-bind="buttonBind"
        :color="colors"
        v-on="$listeners"
    />
</template>

<script lang="ts">
import { ToggleButton } from 'vue-js-toggle-button';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { ToggleButtonProps } from '@/components/molecules/buttons/toggle-button/type';
import color from '@/styles/colors';

enum TOGGLE_BUTTON_THEME {
    secondary = 'secondary',
    gray900 = 'gray900',
    white = 'white',
}

export default {
    name: 'PToggleButton',
    components: {
        ToggleButton,
    },
    props: {
        value: {
            type: Boolean,
            default: true,
        }, // Initial State of the toggle button
        sync: {
            type: Boolean,
            default: false,
        }, // watching changes in value property
        speed: {
            type: Number,
            default: 300,
        }, // Transition Time
        labels: {
            type: [Boolean, Object],
            default: false,
        }, // Boolean - show/hides default labels & Object - set custom labels
        width: {
            type: Number,
            default: 32,
        },
        height: {
            type: Number,
            default: 16,
        },
        margin: {
            type: Number,
            default: 2,
        },
        name: {
            type: String,
            default: undefined,
        }, // Name to attach to the generated input field
        theme: {
            type: String,
            default: TOGGLE_BUTTON_THEME.secondary,
            validator(theme) {
                return Object.keys(TOGGLE_BUTTON_THEME).includes(theme);
            },
        },
    },

    setup(props: ToggleButtonProps) {
        const state = reactive({
            colors: computed(() => {
                if (props.theme === 'secondary') return { checked: color.blue[500], unchecked: color.gray[200] };
                if (props.theme === 'white') return { checked: '#00FF00', unchecked: '#FF0000' };
                return { checked: color.blue[500], unchecked: color.gray[200] };
            }),
            buttonBind: computed(() => ({
                ...props,
            })),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
