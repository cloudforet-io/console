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
        <p-hr />
    </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PHr from '@/components/atoms/hr/Hr.vue';

export default defineComponent({
    name: 'PPanelTop',
    components: { PHr },
});
</script>

<style lang="scss" scoped>
    .p-panel-top {
        margin-bottom: 1rem;
        .top-contents {
            display: flex;
            width: 100%;
            height: 3rem;
            align-items: center;
        }
        .title {
            font-size: 1.125rem;
            padding-right: 1rem;
        }
        .extra {
            flex-grow: 1;
        }
    }
</style>
