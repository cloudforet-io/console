<template>
    <input v-focus.lazy="isFocused"
           v-bind="$attrs"
           type="number"
           :step="1"
           :min="0"
           v-on="inputListeners"
    >
</template>

<script lang="ts">
export default {
    name: 'QuerySearchInteger',
    props: {
        isFocused: {
            type: Boolean,
            default: undefined,
        },
        inputListeners: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        return {
        };
    },
};
</script>
