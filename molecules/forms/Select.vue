<template>
    <select
        v-model="proxySelected"
        :class="classObject"
        :size="optionSize"
        :multiple="multiple"
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
    computed: {
        classObject() {
            const obj = { 'custom-select': this.customStyle };
            obj[selectSize[this.selectSize]] = !!this.selectSize;
            return obj;
        },
        proxySelected: {
            get() {
                return this.selected;
            },
            set(value) {
                this.$emit('update:selected', value);
            },
        },
    },
    methods: {
        onChange(event) {
            this.$emit('update:selected', event.target.value);
        },
    },
};
</script>

<style scoped>

</style>
