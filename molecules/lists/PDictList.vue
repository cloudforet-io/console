<template>
    <ul>
        <li v-for="(value, key) in dict" :key="key">
            {{ key }} : {{ value }}
        </li>
    </ul>
</template>

<script>

export default {
    name: 'PDictList',
    props: {
        dict: {
            type: Object,
            default: () => {},
        },
    },

};
</script>
<style lang="postcss" scoped>
    ul {
        list-style-type: disc;
    }
    li {
        display: list-item;
    }
</style>
