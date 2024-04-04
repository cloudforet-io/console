<script lang="ts" setup>
import {
    PPaneLayout,
} from '@spaceone/design-system';

interface Props {
    displayBlockInMobile?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    displayBlockInMobile: false,
});
</script>

<template>
    <p-pane-layout class="cost-report-overview-card-template">
        <div class="top-part"
             :class="{ 'block-in-mobile': props.displayBlockInMobile }"
        >
            <span class="title">
                <slot name="title" />
            </span>
            <div class="right-extra">
                <slot name="right-extra" />
            </div>
        </div>
        <div class="content-wrapper">
            <slot name="content" />
        </div>
    </p-pane-layout>
</template>

<style lang="scss" scoped>
.cost-report-overview-card-template {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    .top-part {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
            @apply text-label-lg font-bold;
        }

        @screen mobile {
            &.block-in-mobile {
                display: block;
            }
        }
    }
    .content-wrapper {
        padding-top: 1rem;
    }
}
</style>
