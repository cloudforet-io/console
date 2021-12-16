<template>
    <div class="page-information">
        <span>{{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.LEGEND_TITLE') }}</span>

        <span id="circle1" />
        <span class="text-gray-400 text">{{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.LEGEND_UNSET') }} </span>

        <span id="circle3" />
        <span class="text-primary1 text">{{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.LEGEND_LESS_THEN_12') }} </span>

        <span id="circle5" />
        <span class="text-primary-dark text">{{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.LEGEND_GREATER_THEN_12') }}</span>
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
        @apply bg-gray-300 rounded-xs;
        margin-left: 1rem;
        width: 0.625rem;
        height: 0.625rem;
        opacity: 0.5;
    }
    #circle3 {
        @apply bg-primary1 rounded-xs;
        width: 0.625rem;
        height: 0.625rem;
    }
    #circle5 {
        @apply bg-primary-dark rounded-xs;
        width: 0.625rem;
        height: 0.625rem;
    }
    .text {
        margin-left: 0.125rem;
        margin-right: 0.5rem;
        font-size: 0.625rem;
    }
}

</style>
