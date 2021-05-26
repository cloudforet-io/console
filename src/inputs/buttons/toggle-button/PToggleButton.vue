<template>
    <toggle-button
        :value="value"
        :color="colors"
        :width="32"
        :height="16"
        :margin="2"
        v-on="$listeners"
    />
</template>

<script lang="ts">
import { ToggleButton } from 'vue-js-toggle-button';

import { computed, reactive, toRefs } from '@vue/composition-api';
import { TOGGLE_BUTTON_THEME } from '@/inputs/buttons/toggle-button/config';
import { ToggleButtonProps } from '@/inputs/buttons/toggle-button/type';
import color from '@/styles/colors';

/**
 * Used library: vue-js-toggle-button
 * https://www.npmjs.com/package/vue-js-toggle-button
 */

export default {
    name: 'PToggleButton',
    components: {
        ToggleButton,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
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
                if (props.theme === 'peacock500') return { checked: color.peacock[400], unchecked: color.gray[200] };
                return { checked: color.blue[500], unchecked: color.gray[200] };
            }),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>
