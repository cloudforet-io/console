<template>
    <div class="page-information">
        <!--        <span>UPDATED {{ currentDate }} (Local Time) </span>-->
        <span>사용 비율</span>

        <span id="circle1" />
        <span class="text-gray-400 text">10%</span>

        <span id="circle2" />
        <span class="text-primary2 text">20%</span>

        <span id="circle3" />
        <span class="text-primary1 text">30%</span>

        <span id="circle4" />
        <span class="text-primary text">80%</span>

        <span id="circle5" />
        <span class="text-primary-dark text">100%</span>
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
        line-height: 0.8;
        #circle1 {
            @apply bg-gray-200;
            margin-left: 1rem;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
            opacity: 0.5;
        }
        #circle2 {
            @apply bg-primary2;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
            opacity: 0.5;
        }
        #circle3 {
            @apply bg-primary1;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
        }
        #circle4 {
            @apply bg-primary;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
        }
        #circle5 {
            @apply bg-primary-dark;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 50%;
        }
        .text {
            margin-left: 0.125rem;
            margin-right: 0.5rem;
            font-size: 0.625rem;
        }
    }

</style>
