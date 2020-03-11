<template>
    <p-ul>
        <p-li v-for="(value, key) in dict" :key="key">
            {{ key }} : {{ value }}
        </p-li>
    </p-ul>
</template>

<script>
import PUl from '@/components/atoms/lists/orun-list/Ul.vue';
import PLi from '@/components/atoms/lists/orun-list/Li.vue';

export default {
    name: 'PDictList',
    components: { PLi, PUl },
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
