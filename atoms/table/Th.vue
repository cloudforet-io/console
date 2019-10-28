<template>
    <th :class="classObject" :colspan="colspan"><slot></slot></th>
</template>

<script>
import styleMixin from '@/components/atoms/table/styleMixin';

export default {
    name: 'p-th',
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
