<template>
    <span class="p-route-breadcrumb">
        <template v-for="route in routes">
            <template v-if="current.name === route.name || !hasNext">

                <router-link v-if="route.meta && route.meta.breadcrumb" :key="route.name"
                             class="menu"
                             :class="{now: route.name === active.name}"
                             :to="getPath(route)"
                >
                    <span class="link">{{ route.meta.label }}</span>
                </router-link>
                <span v-if="route.meta && route.meta.beta" :key="`${route.name}-beta`" class="beta">BETA</span>

                <template v-if="hasNext">
                    <p-i :key="`${route.name}-arrow`" name="ic_breadcrum_arrow" color="transparent currentColor" />
                    <p-route-breadcrumb v-if="current.name === route.name" :key="`${route.name}-bc`"
                                        :current-idx="currentIdx + 1"
                                        :active-idx="proxyActiveIdx"
                                        :routes="route.children"
                    />
                </template>

            </template>
        </template>
    </span>
</template>

<script lang="ts">
import { computed } from '@vue/composition-api';
import { findLastIndex } from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';

const PRouteBreadcrumb = () => import('@/components/molecules/breadcrumbs/breadcrumb/PRouteBreadcrumb.vue');

export default {
    name: 'PRouteBreadcrumb',
    components: {
        PI,
        PRouteBreadcrumb,
    },
    props: {
        currentIdx: {
            type: Number,
            default: 1,
        },
        activeIdx: {
            type: Number,
            default: undefined,
        },
        routes: Array,
        pathPrefix: {
            type: String,
            default: '/',
        },
    },
    setup(props, context) {
        const matched: any = computed(() => context.root.$route.matched);
        const current = computed(() => matched.value[props.currentIdx]);

        const proxyActiveIdx: any = computed(() => props.activeIdx || findLastIndex(matched.value, { meta: { breadcrumb: true } }));
        const active = computed(() => matched.value[proxyActiveIdx.value]);
        const hasNext = computed(() => props.currentIdx < proxyActiveIdx.value);

        const getPath = (route) => {
            if (hasNext.value) {
                return { path: current.value.path };
            }
            const parent = matched.value[props.currentIdx - 1] || current.value;
            return `${parent.path}/${route.path}`;
        };
        return {
            current,
            proxyActiveIdx,
            active,
            hasNext,
            matched,
            getPath,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-route-breadcrumb {
    height: 100%;
}
.menu {
    @apply text-black;
    padding: 0 1rem;
    font-size: 0.875rem;
    box-sizing: content-box;
    height: calc(100% - 0.25rem);
    .link {
        @apply h-full inline-flex items-center cursor-pointer border-primary;
        &:hover {
            @apply text-secondary;
        }
    }
    &.now {
        .link {
            @apply text-primary font-bold;
            border-bottom-width: 0.25rem;
            &:hover {
                @apply text-secondary;
            }
        }
    }
}
.beta {
    @apply text-coral;
    font-size: 0.5rem;
    font-weight: bold;
    vertical-align: super;
    margin-left: -0.8rem;
}
</style>
