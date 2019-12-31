<template>
    <div class="p-pane-layout" v-on="$listeners">
        <slot />
    </div>
</template>

<script>
export default {
    name: 'PPaneLayout',
};
</script>

<style lang="scss" scoped>
.p-pane-layout {
    background-color: $white;
    box-shadow: 0 0 8px rgba($primary, 0.08);
    border: 1px solid $gray3;
    border-radius: 2px;
}
</style>
