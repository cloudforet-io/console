<template>
    <span class="toggle-button"
          :class="{'disabled': disabled}"
    >
        <toggle-button
            :value="value"
            :sync="sync"
            :color="colors"
            :width="32"
            :height="16"
            :margin="2"
            :disabled="disabled"
            v-on="$listeners"
        />
    </span>
</template>

<script lang="ts">
import {
    defineComponent, computed, reactive, toRefs,
} from 'vue';

import { ToggleButton } from 'vue-js-toggle-button';

import { TOGGLE_BUTTON_THEME } from '@/inputs/buttons/toggle-button/config';
import type { ToggleButtonProps } from '@/inputs/buttons/toggle-button/type';

import color from '@/styles/colors.cjs';

/**
 * Used library: vue-js-toggle-button
 * https://www.npmjs.com/package/vue-js-toggle-button
 */

export default defineComponent<ToggleButtonProps>({
    name: 'PToggleButton',
    components: {
        ToggleButton,
    },
    props: {
        sync: {
            type: Boolean,
            default: false,
        },
        value: {
            type: Boolean,
            default: false,
        },
        styleType: {
            type: String,
            default: TOGGLE_BUTTON_THEME.secondary,
            validator(theme: TOGGLE_BUTTON_THEME) {
                return Object.values(TOGGLE_BUTTON_THEME).includes(theme);
            },
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },

    setup(props: ToggleButtonProps) {
        const state = reactive({
            colors: computed(() => {
                if (props.styleType === 'secondary') return { checked: color.blue[600], unchecked: color.gray[300] };
                if (props.styleType === 'peacock500') return { checked: color.peacock[400], unchecked: color.gray[300] };
                return { checked: color.blue[600], unchecked: color.gray[300] };
            }),
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>
<style lang="scss">
.toggle-button {
    &.disabled {
        cursor: not-allowed;
    }
}
</style>
