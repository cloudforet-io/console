<template>
    <div class="fnb">
        <div class="fnb-contents">
            <span class="copyright">@2020 Megazone Cloud Inc.</span>
        </div>
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
        color: $gray2;
        .fnb-contents {
            height: 100%;
            padding: 2rem 0;
            margin: 0 1.5rem;
            border-top: 1px solid $primary3;
        }
    }
</style>
