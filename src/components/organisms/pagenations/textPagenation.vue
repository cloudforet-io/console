<template>
    <nav>
        <p-icon-button
            icon="fa-angle-left"
            :disabled="thisPage === 1"
            @click="update(thisPage-1)"
        />
        <span class="text-pagenation">{{ thisPage }}/{{ allPage }}</span>
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

<style lang="scss" scoped>
    .text-pagenation{
        display:inline-block;
        min-width: 64px;
        text-align: center;
    }

</style>
