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
    name: 'BaseSimpleInput',
    model: {
        props: 'value',
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
            var vm = this;
            return Object.assign({},
                this.$listeners,
                {
                    mousedown: function (event) {
                        if (vm.isFocused && vm.autoselect) {
                            vm.setSelectionRange(
                                vm.autoselect.start || 0, 
                                vm.autoselect.end || vm.value.length
                            );
                        }
                        vm.$emit('mousedown', event);
                    }
                }
            );
        }
    },
    created () {
    },
    methods: {
        setSelectionRange (selectionStart, selectionEnd) {
            this.$refs.input.setSelectionRange(selectionStart, selectionEnd);
        }
    }
};
</script>

<style lang="scss" scoped>
input {
    border: 0;
    background-color: transparent;
    word-break: break-all;
}
</style>
