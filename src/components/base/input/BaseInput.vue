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
        prop: 'value',
        event: 'inputText'
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
        /**
         * autoselect = {maxWidth: '960px', minWidth: '20px', comfortZone: 0}
         */
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
    watch: {
        autoselect () {
            this.applyAutoSelection();
        }
    },
    created () {
    },
    methods: {
        setSelectionRange (selectionStart, selectionEnd) {
            this.$refs.input.setSelectionRange(selectionStart, selectionEnd);
        },
        applyAutoSelection () {
            if (typeof this.autoselect === 'boolean') {
                this.setSelectionRange(this.autoselect.start, this.value.length);
            } else {
                this.setSelectionRange(this.autoselect.start || 0, this.autoselect.end || this.value.length);
            }
        },
        onFocus (event) {
            this.isFocused = true;
            if (this.autoselect) {
                this.applyAutoSelection();
            }
          /**
           * input focus event
           * @event focus
           * @type {object}
           */
            this.$emit('focus', event);
        },
        onBlur (event) {
            this.isFocused = false;
          /**
           * input blur event
           * @event blur
           * @type {object}
           */
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
