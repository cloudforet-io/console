<template>
    <input v-focus.lazy="isFocused"
           v-bind="$attrs"
           placeholder="YYYY-MM-DD"
           type="text"
           v-on="inputListeners"
    >
</template>

<script lang="ts">
export default {
    name: 'QuerySearchDatetime',
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
