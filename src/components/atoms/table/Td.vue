<template>
    <td :class="classObject" :colspan="colspan"><slot></slot></td>
</template>

<script>
import styleMixin from '@/components/atoms/table/styleMixin';

export default {
    name: 'p-td',
    mixins: [styleMixin],
    props: {
        colspan: {
            type: Number,
            default: null,
        },
    },
};
</script>

<style scoped>

</style>
