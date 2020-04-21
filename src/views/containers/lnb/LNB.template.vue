<template>
    <div class="lnb">
        <p-breadcrumb :current-idx="currentIdx"
                      :routes="routes"
        />
    </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';
import PRouteBreadcrumb from '@/components/molecules/breadcrumbs/breadcrumb/RouteBreadcrumb.vue';

export const setRouteState = (routes, currentIdx) => reactive({
    currentIdx: currentIdx || 1,
    routes: routes || [],
});

export default {
    name: 'LNBTemplate',
    components: { PRouteBreadcrumb },
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
        height: 40px;
        box-shadow: 0px 0.25rem 0.5rem rgba(theme('colors.gray.900'), 0.08);
        padding: 0 1.125rem;
    }
</style>
