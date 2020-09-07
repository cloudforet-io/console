<template>
    <div class="page-information">
        <span>UPDATED 2020-08-10</span> <span class="divider" />
        <span class="text-gray-400">LESS</span>
        <span id="circle1" />
        <span id="circle2" />
        <span id="circle3" />
        <span id="circle4" />
        <span id="circle5" />
        <span class="text-primary">MORE</span>
    </div>
</template>

<script>
export default {
    name: 'PageInformation',
};
</script>

<style lang="postcss" scoped>
    .page-information {
        @apply flex flex-row;
        margin-top: -1rem;
        margin-bottom: 0.625rem;
        font-size: 0.75rem;
        line-height: 120%;
        .divider {
            @apply my-0 text-gray-200;
            height: 0.875rem;
            border-left-width: 1px;
            margin-left: 0.5rem;
            margin-right: 0.5rem;
        }
        #circle1 {
            @apply bg-gray-100;
            margin-left: 0.25rem;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
            opacity: 0.5;
        }
        #circle2 {
            @apply bg-primary2;
            margin-left: -0.125rem;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
            opacity: 0.5;
        }
        #circle3 {
            @apply bg-primary1;
            margin-left: -0.125rem;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
        }
        #circle4 {
            @apply bg-primary;
            margin-left: -0.125rem;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
        }
        #circle5 {
            @apply bg-primary-dark;
            margin-left: -0.125rem;
            margin-right: 0.25rem;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
        }
    }

</style>
