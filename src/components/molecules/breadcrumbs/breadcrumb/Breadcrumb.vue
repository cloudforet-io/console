<template>
    <span class="p-breadcrumb">
        <template v-for="route in routes">
            <template v-if="current.name === route.name || !hasNext">

                <router-link v-if="route.meta && route.meta.breadcrumb" :key="route.name"
                             class="menu"
                             :class="{now: route.name === active.name}"
                             :to="getPath(route)"
                >
                    <span class="link">{{ route.meta.label }}</span>
                    <span v-if="route.meta && route.meta.beta" class="beta">BETA</span>
                </router-link>

                <template v-if="hasNext">
                    <p-i :key="`${route.name}-arrow`" name="ic_breadcrum_arrow" />
                    <p-breadcrumb v-if="current.name === route.name" :key="`${route.name}-bc`"
                                  :current-idx="currentIdx + 1"
                                  :active-idx="proxyActiveIdx"
                                  :routes="route.children"
                    />
                </template>

            </template>
        </template>
    </span>
</template>

<script>
import { computed } from '@vue/composition-api';
import _ from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';

const PBreadcrumb = () => import('@/components/molecules/breadcrumbs/breadcrumb/Breadcrumb.vue');

export default {
    name: 'PBreadcrumb',
    components: {
        PI,
        PBreadcrumb,
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
        const matched = computed(() => context.root.$route.matched);
        const current = computed(() => matched.value[props.currentIdx]);

        const proxyActiveIdx = computed(() => props.activeIdx || _.findLastIndex(matched.value, { meta: { breadcrumb: true } }));
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
.menu {
    @apply text-gray ;
    padding: 0 1rem .1rem 1rem;
    font-size: 0.875rem;
    line-height: 2rem;
    cursor: pointer;
    &:hover {
        @apply text-secondary;
    }
    &.now {
        .link {
            @apply border-b-2 border-primary text-primary;
            font-weight: bold;
            &:hover {
                @apply text-secondary;
            }
        }
    }
    .beta {
        @apply text-coral;
        font-size: .5rem;
        font-weight: bold;
        vertical-align: super;
        margin-left: .2rem;
    }
}
</style>
