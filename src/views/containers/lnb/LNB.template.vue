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

<style lang="postcss" scoped>
    .lnb {
        @apply bg-white;
        position: relative;
        display: flex;
        align-items: center;
        z-index: 10;
        height: $lnb-height;
        box-shadow: 0px .25rem .5rem rgba(theme('colors.dark'), 0.08);
        padding: 0 1.125rem;
    }
</style>