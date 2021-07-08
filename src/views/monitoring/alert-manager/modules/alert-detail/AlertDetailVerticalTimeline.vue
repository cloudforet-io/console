<template>
    <div class="timeline-wrapper">
        <ul class="timeline-list">
            <li class="timeline-item">
                <div class="timestamp">
                    2021/05/17<br>
                    <b>12:32:01</b>
                </div>
                <div class="item-detail">
                    test description
                </div>
            </li>
            <li class="timeline-item">
                <div class="timestamp">
                    2021/05/17<br>
                    <b>12:32:01</b>
                </div>
                <div class="item-detail">
                    test<br>
                    test<br>
                    test
                </div>
            </li>
            <li class="timeline-item">
                <div class="timestamp">
                    2021/05/17<br>
                    <b>12:32:01</b>
                </div>
                <div class="item-detail">
                    <slot name="timeline-detail" />
                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
export default {
    name: 'AlertDetailVerticalTimeline',
};
</script>

<style lang="postcss" scoped>
.timeline-wrapper {
    .timeline-list {
        padding: 0;
        display: inline-block;
    }
    .timeline-item {
        @apply border-l border-gray-200;
        margin-left: 7.5rem;
        position: relative;
        padding-left: 1rem;
        padding-bottom: 1.5rem;
        min-height: 3.25rem;

        &:before {
            @apply border-4 border-primary3 bg-primary;
            position: absolute;
            left: -7px;
            content: " ";
            border-radius: 500%;
            height: 0.875rem;
            width: 0.875rem;
            transition: all 500ms ease-in-out;
        }
        &:last-child {
            border-left: 0;
        }
    }
}
.timestamp {
    position: absolute;
    width: 100px;
    left: -7.5rem;
    text-align: right;
    font-size: 0.875rem;
    line-height: 140%;
}
.item-detail {
    font-size: 0.875rem;
    line-height: 150%;
}
</style>
