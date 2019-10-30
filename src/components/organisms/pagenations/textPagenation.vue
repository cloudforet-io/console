<template>
    <nav>
        <p-icon-button
            icon="fa-angle-left"
            :disabled="thisPage === 1"
            @click="update(thisPage-1)"
        />
        {{ thisPage }}/{{ allPage }}
        <p-icon-button
            icon="fa-angle-right"
            :disabled="thisPage === allPage"
            @click="update(thisPage+1)"
        />
    </nav>
</template>
<script>
import PIconButton from '@/components/molecules/buttons/IconButton';

export default {
    name: 'PTextButton',
    components: { PIconButton },
    props: {
        thisPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
        },
        allPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
        },
    },
    methods: {
        update(page) {
            this.$emit('update:thisPage', page);
            this.$emit('pageChange', page);
        },
    },
};
</script>

<style scoped>

</style>
