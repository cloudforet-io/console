<template>
    <div class="fnb">
        <span
            class="copyright"
            :style="copyrightStyle"
        >@2019 Megazone Cloud Inc.</span>
    </div>
</template>

<script>
import styleVariables from '@/assets/style/_variables.scss';

export default {
    name: 'FNB',
    data() {
        return {
            copyrightStyle: { color: styleVariables.primary },
        };
    },
};
</script>

<style lang="scss" scoped>
    .fnb {
        height: $fnb-height;
        border: 1px solid aqua;
    }
</style>
