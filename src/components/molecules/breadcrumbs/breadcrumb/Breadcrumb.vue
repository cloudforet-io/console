<template>
    <span>
        <template v-for="route in routes">
            <span v-if="current.name === route.name || !hasNext" :key="route.name">

                <span v-if="route.meta && route.meta.breadcrumb"
                      class="menu"
                      :class="{active: route.name === active.name}"
                      @click="go(route)"
                >
                    <span class="link">{{ route.meta.label }}</span>
                </span>

                <template v-if="hasNext">
                    <p-i name="ic_breadcrum_arrow" />
                    <p-breadcrumb v-if="current.name === route.name" :key="route.name"
                                  :current-idx="currentIdx + 1"
                                  :active-idx="proxyActiveIdx"
                                  :routes="route.children"
                    />
                </template>

            </span>
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

        const go = (route) => {
            if (hasNext.value) {
                context.root.$router.push({ path: current.value.path });
            } else {
                const parent = matched.value[props.currentIdx - 1] || current.value;
                context.root.$router.push(`${parent.path}/${route.path}`);
            }
        };

        return {
            current,
            proxyActiveIdx,
            active,
            hasNext,
            matched,
            go,
        };
    },
};
</script>

<style lang="scss" scoped>
.menu {
    padding: 0 1rem .1rem 1rem;
    color: $gray;
    font-size: 0.875rem;
    line-height: 1rem;
    cursor: pointer;
    &:hover {
        color: $secondary;
    }
    &.active {
        .link {
            border-bottom: 2px solid $primary;
            color: $primary;
            font-weight: bold;
            &:hover {
                color: $secondary;
            }
        }
    }
}
</style>
