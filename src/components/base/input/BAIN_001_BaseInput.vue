<template>
  <span>
    <input ref="input" 
           v-focus.lazy="isFocused" 
           v-autowidth="autowidth"
           :value="value"
           class="pl-2" 
           v-bind="$attrs"
           v-on="inputListeners"
           @input="$emit('inputText', $event.target.value)"
    >
  </span>
</template>

<script>
export default {
    name: 'BaseInput',
    model: {
        props: 'value',
        events: 'inputText'
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        autofocus: {
            type: Boolean,
            default: false
        },
        autowidth: {
            type: Object,
            default: () => {}
        },
        /**
         * autoselect =
         * {
                start: 0,
                end: 0
            }
         */
        autoselect: {
            type: [Object, Boolean],
            default: null
        }
    },
    data () {
        return {
            isFocused: this.autofocus
        };
    },
    computed: {
        inputListeners: function () {
            return Object.assign({},
                this.$listeners,
                {
                    focus: this.onFocus,
                    blur: this.onBlur
                }
            );
        }
    },
    created () {
    },
    methods: {
        setSelectionRange (selectionStart, selectionEnd) {
            this.$refs.input.setSelectionRange(selectionStart, selectionEnd);
        },
        onFocus (event) {
            this.isFocused = true;
            if (this.autoselect) {
                this.setSelectionRange(
                    this.autoselect.start || 0, 
                    this.autoselect.end || this.value.length
                );
            }
            this.$emit('focus', event);
        },
        onBlur (event) {
            this.isFocused = false;
            this.$emit('blur', event);
        },
        forceBlur () {
            this.isFocused = false;
        },
        forceFocus () {
            this.isFocused = true;
        }
    }
};
</script>

<style lang="scss" scoped>
input {
    border: 0;
    background-color: transparent;
    word-break: break-all;
    display: inline-block;
}
</style>
