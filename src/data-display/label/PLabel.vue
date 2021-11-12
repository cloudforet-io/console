<template>
    <label class="p-label" v-on="$listeners">
        <slot>
            {{ label }}
        </slot>
    </label>
</template>

<script lang="ts">
export default {
    name: 'PLabel',
    props: {
        label: {
            type: String,
            default: '',
        },
    },
};
</script>
<style lang="postcss">
.p-label {
    @apply text-gray-900;
    display: inline-block;
    font-size: 0.875rem;
    font-weight: bold;
    letter-spacing: 0;
    line-height: 1.4rem;
    margin-bottom: 0.25rem;
}
</style>
