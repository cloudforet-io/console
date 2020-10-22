<template>
    <div class="page-information">
        <span>반복 스케줄 설정 시간</span>

        <span id="circle1" />
        <span class="text-gray-400 text">미설정 </span>

        <span id="circle3" />
        <span class="text-primary1 text">12시간 미만 </span>

        <span id="circle5" />
        <span class="text-primary-dark text">12시간 이상</span>
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
            @apply bg-gray-300;
            margin-left: 1rem;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 0.125rem;
            opacity: 0.5;
        }
        #circle3 {
            @apply bg-primary1;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 0.125rem;
        }
        #circle5 {
            @apply bg-primary-dark;
            width: 0.625rem;
            height: 0.625rem;
            border-radius: 0.125rem;
        }
        .text {
            margin-left: 0.125rem;
            margin-right: 0.5rem;
            font-size: 0.625rem;
        }
    }

</style>
