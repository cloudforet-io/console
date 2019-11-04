<template>
    <nav class="text-pagenation">
        <p-icon-button
            name="ic_arrow_left"
            :disabled="thisPage === 1"
            @click="update(thisPage-1)"
        />
        <div class="page-number">
            <div>{{ thisPage }}/{{ allPage }}</div>
        </div>

        <p-icon-button
            name="ic_arrow_right"
            :disabled="thisPage === allPage"
            @click="update(thisPage+1)"
        />
    </nav>
</template>
<script>
import PIconButton from '@/components/molecules/buttons/IconButton';
import PI from '@/components/atoms/icons/PI';

export default {
    name: 'PTextButton',
    components: { PIconButton, PI },
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
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap:nowrap;
        min-width: 64px;
    }
    .page-number{
        display: inline-flex;
        justify-content: center;
        min-width: 64px;
        min-height: 32px;
        align-items: center;
    }

</style>
