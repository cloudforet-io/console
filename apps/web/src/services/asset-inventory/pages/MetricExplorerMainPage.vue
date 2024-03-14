<script lang="ts" setup>
</script>

<template>
    <div class="metric-explorer-content">
        <!--header-->
        Metric Explorer 깡통
        <div class="content-wrapper">
            <div class="overflow-wrapper">
                <!--query section-->
                <div class="contents-wrapper">
                    <!--group by-->
                    <!--chart-->
                    <!--data table-->
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-content {
    .content-wrapper {
        overflow-x: auto;
        padding-bottom: 1.625rem;
        .overflow-wrapper {
            min-width: 50rem;
            .contents-wrapper {
                @apply bg-white rounded-md border border-gray-200;
                padding: 0 1rem 2.5rem 1rem;
            }
        }
    }
}
</style>
