<template>
    <span class="p-checkbox"
          @click.stop.prevent="onClick"
          v-on="$listeners"
    >
        <input type="checkbox">
        <slot :slot-scope="$props" name="icon">
            <p-i width="1.25rem" height="1.25rem"
                 class="check-icon" :class="{selected: isSelected}"
                 :color="isSelected ? undefined : 'inherit transparent'"
                 :name="isSelected ? 'ic_checkbox--checked' : 'ic_checkbox'"
            />
        </slot>
        <span v-if="$scopedSlots.default" class="text" @click.stop="onClick">
            <slot name="default" />
        </span>
    </span>
</template>

<script lang="ts">
import { indexOf, pull } from 'lodash';

import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import PI from '@/components/atoms/icons/PI.vue';
import { CheckboxProps } from '@/components/molecules/forms/checkbox/type';

export default {
    name: 'PCheckBox',
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        value: {
            type: [Boolean, String, Number, Object],
            default: undefined,
        },
        selected: {
            type: [Boolean, Array],
            default: () => ([]),
        },
    },
    setup(props: CheckboxProps, context) {
        const state = reactive({
            isSelected: computed(() => {
                if (typeof props.selected === 'boolean') {
                    return props.selected;
                }
                return indexOf(props.selected, props.value) !== -1;
            }),
        });
        const onClick = () => {
            if (typeof props.selected === 'boolean') {
                context.emit('change', !props.selected);
            } else {
                const newResult = [...props.selected];
                if (state.isSelected) {
                    pull(newResult, props.value);
                } else { newResult.push(props.value); }
                context.emit('change', newResult, state.isSelected);
            }
        };
        return {
            ...toRefs(state),
            onClick,

        };
    },
    methods: {

    },
};
</script>

<style lang="postcss">
.p-checkbox {
    input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }
    &:hover {
        .check-icon {
            @apply text-gray-900;
        }
    }
    &:not(:hover) {
        .check-icon {
            @apply text-gray-300;
        }
    }
    .check-icon {
        @apply cursor-pointer;
    }
}
</style>
