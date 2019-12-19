<template>
    <p-ul>
        <p-li v-for="(key,value) in tags" :key="key">
            {{ key }} : {{ value }}
        </p-li>
    </p-ul>
</template>

<script>
import PUl from '@/components/atoms/lists/orun-list/Ul';
import PLi from '@/components/atoms/lists/orun-list/Li';

export default {
    name: 'PTagList',
    components: { PLi, PUl },
    props: {
        tags: {
            type: Object,
            default: () => {},
        },
    },

};
</script>
<style lang="scss" scoped>
    ul {
        list-style-type: disc;
    }
    li {
        display: list-item;
    }
</style>
