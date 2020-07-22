<template>
    <div class="lnb">
        <p-route-breadcrumb :current-idx="currentIdx"
                            :routes="routes"
        />
    </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';
import PRouteBreadcrumb from '@/components/molecules/breadcrumbs/breadcrumb/PRouteBreadcrumb.vue';

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
        @apply bg-white border-b border-gray-200;
        position: relative;
        height: 3rem;
        padding: 0 1rem;
    }
</style>
