<template>
    <span class="p-checkbox"
          @mouseenter="onMouseover(true)"
          @mouseleave="onMouseover(false)"
          @click.stop.prevent="onClick"
    >
        <input type="checkbox">
        <p-i class="checkmark" width="1.25rem" height="1.25rem"
             v-bind="checkBoxBind"
        />
    </span>
</template>

<script>
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI';
import { dark } from '@/styles/_variables.scss';

export default {
    name: 'PCheckBox',
    components: { PI },
    model: {
        prop: 'selected',
        event: 'change',
    },
    props: {
        value: [Boolean, String, Number, Object],
        selected: [Boolean, Array],
        hovered: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            mouseover: false,
        };
    },
    computed: {
        isSelected() {
            if (typeof this.selected === 'boolean') {
                return this.selected;
            }
            return _.indexOf(this.selected, this.value) !== -1;
        },
        checkBoxBind() {
            let name = 'ic_checkbox';
            let color;
            let fill;
            if (this.isSelected) {
                name += '--checked';
            } else if (this.hovered || this.mouseover) {
                color = `transparent ${dark}`;
                fill = false;
            }
            return {
                name,
                color,
                fill,
            };
        },
    },
    methods: {
        onClick() {
            if (typeof this.selected === 'boolean') {
                this.$emit('change', !this.selected);
                return;
            }
            const newResult = [...this.selected];
            if (this.isSelected) {
                _.pull(newResult, this.value);
            } else { newResult.push(this.value); }
            this.$emit('change', newResult, this.isSelected);
        },
        onMouseover(value) {
            this.mouseover = value;
        },
    },
};
</script>

<style lang="scss" scoped>
    .p-checkbox {
        input{
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }
    }
</style>
