<template>
    <div class="p-divider-header">
        <div class="title">
            <slot />
        </div>
        <slot name="extra" />
        <p-hr />
    </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PHr from '@/components/atoms/hr/Hr.vue';

export default defineComponent({
    name: 'DividerHeader',
    components: { PHr },
});
</script>

<style lang="scss" scoped>
.p-divider-header{
     margin-bottom: 0.5rem;
    .title{
        height: 2rem;
        display: inline-flex;
        text-align: left;
        font:  18px Arial;
        letter-spacing: 0;
        color: #202433;
        margin-right: 0.5rem;
        align-self:center;
    }
}
</style>
