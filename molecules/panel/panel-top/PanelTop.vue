<template>
    <div class="p-panel-top">
        <div class="top-contents">
            <span class="title">
                <slot />
            </span>
            <div class="extra">
                <slot name="extra" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
    name: 'PPanelTop',
});
</script>

<style lang="postcss" scoped>
    .p-panel-top {
        margin-bottom: 1rem;
        .top-contents {
            display: flex;
            width: 100%;
            height: 2rem;
            align-items: center;
        }
        .title {
            @apply font-bold text-2xl;
            font-family: Noto Sans;
            padding-right: 1rem;
        }
        .extra {
            flex-grow: 1;
        }
    }
</style>
