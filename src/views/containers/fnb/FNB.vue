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

<style lang="postcss" scoped>
    .fnb {
        @apply text-gray-200;
        height: $fnb-height;
        .fnb-contents {
            @apply border-t border-primary3;
            height: 100%;
            padding: .5rem 0;
            margin: 0rem 1.5rem;
        }
    }
</style>
