<template>
    <input v-focus.lazy="isFocused"
           v-bind="$attrs"
           type="text"
           v-on="$listeners"
    >
</template>

<script lang="ts">
export default {
    name: 'QuerySearchString',
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
