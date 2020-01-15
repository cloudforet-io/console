<template>
    <div class="lnb">
        <p-breadcrumb :current-idx="currentIdx"
                      :routes="routes"
        />
    </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';
import PBreadcrumb from '@/components/molecules/breadcrumbs/breadcrumb/Breadcrumb.vue';

export const setRouteState = (routes, currentIdx) => reactive({
    currentIdx: currentIdx || 1,
    routes: routes || [],
});

export default {
    name: 'LNBTemplate',
    components: { PBreadcrumb },
    setup() {
        return {
            ...toRefs(setRouteState()),
        };
    },
};
</script>

<style lang="scss" scoped>
    .lnb {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        height: $lnb-height;
        box-shadow: 0px 4px 8px rgba($dark, 0.08);
        background-color: $white;
        padding: 12px 18px;
    }
</style>
