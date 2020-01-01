<template>
    <span class="p-radio"
          @mouseenter="onMouseover(true)"
          @mouseleave="onMouseover(false)"
          @click.stop.prevent="onClick"
    >
        <input type="radio">
        <p-i class="radio-icon" width="1.25rem" height="1.25rem"
             v-bind="radioBind"
        />
    </span>
</template>

<script>
import _ from 'lodash';
import { ref, computed } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI';
import { dark } from '@/styles/_variables.scss';

export default {
    name: 'PRadio',
    events: ['change'],
    components: { PI },
    model: {
        prop: 'value',
        event: 'change',
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        hovered: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const mouseover = ref(false);

        const radioBind = computed(() => {
            let name = 'ic_radio';
            let color;
            let fill;
            if (props.value) {
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

        const onClick = () => {
            context.emit('change', !props.value);
        };

        const onMouseover = (val) => {
            mouseover.value = val;
        };
        return {
            radioBind,
            onClick,
            onMouseover,
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
