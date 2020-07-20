<template>
    <div class="p-box-layout"
         :class="boxStyle"
         v-on="$listeners"
    >
        <slot />
    </div>
</template>

<script>
export default {
    name: 'PBoxLayout',
    props: {
        boxStyle: {
            type: String,
            default: 'primary4',
        },
    },
};
</script>

<style lang="postcss" scoped>
.p-box-layout {
    padding: 0.5rem;
    border: 1px solid;
    border-radius: 2px;

    @define-mixin box-color $theme, $bg-color, $line-color {
        &.$(theme) {
            background-color: $bg-color;
            border-color: $line-color;
        }
    }

    @mixin box-color primary4, theme('colors.primary4'), theme('colors.gray.100');
}
</style>
