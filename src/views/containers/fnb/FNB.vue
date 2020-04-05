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
        height: 40px;
        .fnb-contents {
            @apply border-t border-primary3;
            height: 100%;
            padding: 0.5rem 0;
            margin: 0 1.5rem;
        }
    }
</style>
