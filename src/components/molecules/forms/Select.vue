<template>
    <select
        v-model="value"
        :class="classObject"
        :size="optionSize"
        :multiple="multiple"
        @input="onChange"
    >
        <template v-for="option in options">
            <slot
                name="option"
                :option="option"
            >
                <option
                    :disabled="option.disabled"
                    :value="option.value"
                >
                    {{ option.text ? option.text : option.value }}
                </option>
            </slot>
        </template>
    </select>
</template>

<script>
const selectSize = {
    sm: 'custom-select-sm',
    lg: 'custom-select-lg',
};
export default {
    name: 'PSelect',
    props: {
        options: {
            type: Array,
            default: () => [],
        },
        selected: {
            type: [String, Number, Boolean, Array, Object, Date, Function, Symbol],
        },
        customStyle: {
            type: Boolean,
            default: true,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        selectSize: {
            type: String,
            default: null,
            validator: value => value in selectSize,
        },
        optionSize: {
            type: Number,
            default: null,
        },
    },
    data() {
        console.log('init', this.selected);
        return {
            value: this.selected,
        };
    },
    computed: {
        classObject() {
            const obj = [
                { custom_select: this.customStyle },
            ];
            if (this.selectSize) {
                obj.push(selectSize[this.selectSize]);
            }
            return obj;
        },
    },
    watch: {
        selected() {
            console.log('watch', this.selected, this.value);
            if (this.selected !== this.value) {
                this.value = this.selected;
            }
        },
    },
    methods: {
        onChange(event) {
            console.log(this.options);
            console.log('change', this.value, event.target.value);
            this.$emit('update:selected', event.target.value);
        },
    },
};
</script>

<style scoped>

</style>
