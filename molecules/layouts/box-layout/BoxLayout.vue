<template>
    <div class="p-box-layout"
         :class="style"
         v-on="$listeners"
    >
        <slot />
    </div>
</template>

<script>
export default {
    name: 'PBoxLayout',
    props: {
        style: {
            type: String,
            default: 'primary4',
        },
    },
};
</script>

<style lang="scss" scoped>
.p-box-layout {
    padding: .5rem;
    border: 1px solid;
    border-radius: 2px;

    @mixin box-color($theme, $bg-color, $line-color) {
        &.#{$theme} {
            background-color: $bg-color;
            border-color: $line-color;
        }
    }

    @include box-color('primary4', $primary4, $gray3);
}
</style>
