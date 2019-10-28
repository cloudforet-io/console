<template>
    <tr :class="classObject"><slot></slot></tr>
</template>

<script>
import styleMixin from '@/components/atoms/table/styleMixin';

export default {
    name: 'p-tr',
    mixins: [styleMixin],
};
</script>

<style scoped>

</style>
