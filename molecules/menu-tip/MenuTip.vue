<template>
    <div class="menu-tip">
        <slot>
            {{contents}}
        </slot>
    </div>
</template>

<script>
export default {
    name: 'p-menu-tip',
    props: {
        contents: {
            type: String,
            default: null,
        },
    },
};
</script>

<style lang="scss" scoped>
    .menu-tip {

    }
</style>
