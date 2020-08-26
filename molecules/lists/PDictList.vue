<template>
    <ul class="p-dict-list">
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
            default: () => ({}),
        },
    },

};
</script>
<style lang="postcss">
    .p-dict-list {
        ul {
            list-style-type: disc;
        }
        li {
            display: list-item;
        }
    }
</style>
