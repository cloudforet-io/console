<template>
    <div class="p-breadcrumbs">
        <span v-for="(route, idx) in routes" :key="idx">
            <span v-if="route.to || route.path">
                <router-link
                    v-if="isLengthOverFive(idx)" class="menu"
                    :to="getLocation(route)"
                >
                    <span v-if="idx !== routes.length - 1" class="inline-block link">{{ route.name }}</span>
                    <span v-else class="inline-block current-page">{{ route.name }}</span>
                    <span v-if="idx < routes.length - 1">
                        <p-i name="ic_breadcrumb_arrow" width="1rem" height="1rem"
                             class="arrow-icon" color="inherit white"
                        />
                    </span>
                </router-link>
            </span>
            <span v-else>
                <div v-if="isLengthOverFive(idx)" class="menu">
                    <span v-if="idx !== routes.length - 1" class="inline-block link"
                          @click="$emit('click', route, idx)"
                    >{{ route.name }}</span>
                    <span v-else class="inline-block current-page">{{ route.name }}</span>
                    <span v-if="idx < routes.length - 1">
                        <p-i name="ic_breadcrumb_arrow" width="1rem" height="1rem"
                             class="arrow-icon" color="inherit white"
                        />
                    </span>
                </div>
            </span>
            <span v-if="routes.length >= 5 && idx === 2 && !state.isShown">
                <span class="inline-block link hidden-underline" @click="showHidden">...</span>
                <p-i name="ic_breadcrumb_arrow" width="1rem" height="1rem"
                     class="arrow-icon" color="inherit white"
                />
            </span>
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api';
import PI from '@/foundation/icons/PI.vue';
import { Location } from 'vue-router';

interface Route {
    name: string;
    path?: string;
    to?: Location;
}

interface Props {
    routes: Route[];
}

export default defineComponent<Props>({
    name: 'PBreadcrumbs',
    components: {
        PI,
    },
    props: {
        routes: {
            type: Array,
            default: () => [],
        },
    },
    setup(props: Props) {
        const state = reactive({
            isShown: false,
        });
        const getLocation = (route: Route): Location => {
            if (route.to) return route.to;
            if (route.path) return { path: route.path };
            return {};
        };
        const showHidden = () => { state.isShown = true; };
        const isLengthOverFive = idx => props.routes.length < 5 || (props.routes.length >= 5 && (idx < 1 || idx > props.routes.length - 3)) || state.isShown;

        return {
            state,
            getLocation,
            showHidden,
            isLengthOverFive,
        };
    },
});
</script>

<style lang="postcss">
.p-breadcrumbs {
    display: inline-flex;
    margin-bottom: 0.5rem;

    .link {
        @apply text-xs text-gray-900 cursor-pointer;
        opacity: 0.5;

        &:hover {
            opacity: 1;
        }
    }

    .current-page {
        @apply text-xs text-gray-900 cursor-default;
        opacity: 0.5;
    }

    .arrow-icon {
        @apply text-gray-200;
        margin-left: 0.25rem;
        margin-right: 0.25rem;
    }

    .hidden-underline {
        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
