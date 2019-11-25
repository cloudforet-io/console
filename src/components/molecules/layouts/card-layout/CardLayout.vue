<template>
    <div class="card-layout">
        <div v-for="(vnode, name) in $slots" :key="name"
             class="card-container"
             :style="{ width: `${100 / $slots.length}%` }"
        >
            <slot :name="name" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'PCardLayout',
};
</script>

<style lang="scss" scoped>
    .card-layout {
        display: table;
        width: 100%;
        table-layout: fixed;
        border: 1px solid $gray2;
        border-radius: 2px;
        padding: 1rem 0;
        .card-container {
            display: table-cell;
            vertical-align: top;
            border-right: 1px solid $gray2;
            padding: 0 1rem;
            &:last-child {
                border-right: 0;
            }
        }
    }
</style>
