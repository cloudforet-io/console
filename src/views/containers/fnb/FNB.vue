<template>
    <div class="fnb">
        <span class="copyright">@2019 Megazone Cloud Inc.</span>
    </div>
</template>

<script>
export default {
    name: 'FNB',
    props: {
        width: {
            type: String,
            default: '100%',
        },
    },
};
</script>

<style lang="scss" scoped>
    .fnb {
        height: $fnb-height;
        border: 1px solid aqua;
    }
</style>
