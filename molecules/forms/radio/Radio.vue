<template>
    <span class="p-radio"
          @mouseenter="mouseover = true"
          @mouseleave="mouseover = false"
          @click.stop.prevent="onClick"
    >
        <input type="radio">
        <p-i class="radio-icon" width="1.25rem" height="1.25rem"
             v-bind="radioBind"
        />
    </span>
</template>

<script>
import { ref, computed } from '@vue/composition-api';
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import { dark } from '@/styles/_variables.scss';

export default {
    name: 'PRadio',
    events: ['change'],
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        selected: [Boolean, String, Number, Object, Array],
        value: {
            type: [Boolean, String, Number, Object, Array],
            default: true,
        },
        hovered: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const isSelected = computed(() => props.selected === props.value);

        const onClick = () => {
            if (!isSelected.value) {
                if (typeof props.selected === 'object') {
                    if (props.selected instanceof Array) emit('change', [...props.value], isSelected.value);
                    else emit('change', { ...props.value }, isSelected.value);
                } else emit('change', props.value, isSelected.value);
            }
        };

        const mouseover = ref(false);
        const radioBind = computed(() => {
            let name = 'ic_radio';
            let color;
            let fill;
            if (isSelected.value) {
                name += '--checked';
            } else if (props.hovered || mouseover.value) {
                color = `transparent ${dark}`;
                fill = false;
            }
            return {
                name,
                color,
                fill,
            };
        });
        return {
            radioBind,
            onClick,
            mouseover,
        };
    },
};
</script>

<style lang="scss" scoped>
.p-radio {
    input {
        position: absolute;
        opacity: 0;
        height: 0;
        width: 0;
    }
    .radio-icon {
        cursor: pointer;
    }
}
</style>
