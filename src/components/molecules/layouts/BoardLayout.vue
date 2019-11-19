<template>
    <div class="board-pane">
        <p v-if="title" class="title">{{ title }}</p>
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'PWidgetLayout',
    props: {
        title: {
            type: String,
            default: null,
        },
    },
};
</script>

<style lang="scss" scoped>
    .board-pane {
        @extend %pane;
        padding: 16px;
        .title {
            padding-top: 14px;
            font-size: 1.125rem;
        }
    }
</style>
