<template>
    <div class="p-breadcrumbs">
        <span v-for="(route, idx) in routes"
              :key="idx"
        >
            <span v-if="route.to || route.path">
                <router-link
                    v-if="isLengthOverFive(idx)"
                    class="menu"
                    :to="getLocation(route)"
                >
                    <span v-if="idx !== routes.length - 1"
                          class="link"
                    >{{ route.name }}</span>
                    <span v-else
                          class="current-page"
                    >
                        {{ route.name }}
                        <p-copy-button v-if="copiable"
                                       :value="route.name"
                        />
                    </span>
                    <span v-if="idx < routes.length - 1">
                        <p-i name="ic_chevron-left-thin"
                             width="1rem"
                             height="1rem"
                             class="arrow-icon"
                             color="inherit white"
                        />
                    </span>
                </router-link>
            </span>
            <span v-else>
                <span v-if="isLengthOverFive(idx)"
                      class="menu"
                >
                    <span v-if="idx !== routes.length - 1"
                          class="link"
                          @click="$emit('click', route, idx)"
                    >{{ route.name }}</span>
                    <span v-else
                          class="current-page"
                    >
                        {{ route.name }}
                        <p-copy-button v-if="copiable"
                                       :value="route.name"
                        />
                    </span>
                    <span v-if="idx < routes.length - 1">
                        <p-i name="ic_chevron-left-thin"
                             width="1rem"
                             height="1rem"
                             class="arrow-icon"
                             color="inherit white"
                        />
                    </span>
                </span>
            </span>
            <span v-if="routes.length >= 5 && idx === 2 && !state.isShown">
                <span class="link"
                      @click="showHidden"
                >...</span>
                <p-i name="ic_chevron-left-thin"
                     width="1rem"
                     height="1rem"
                     class="arrow-icon"
                     color="inherit white"
                />
            </span>
        </span>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent, reactive } from 'vue';

import type { Location } from 'vue-router';

import PI from '@/foundation/icons/PI.vue';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';

interface Route {
    name: string;
    path?: string;
    to?: Location;
}

interface Props {
    routes: Route[];
    copiable?: boolean;
}

export default defineComponent<Props>({
    name: 'PBreadcrumbs',
    components: {
        PCopyButton,
        PI,
    },
    props: {
        routes: {
            type: Array as PropType<Route[]>,
            default: () => [],
        },
        copiable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            isShown: false,
        });
        const getLocation = (route: Route): Location => {
            if (route.to) return route.to;
            if (route.path) return { path: route.path };
            return {};
        };
        const showHidden = () => { state.isShown = true; };
        const isLengthOverFive = (idx) => props.routes.length < 5 || (props.routes.length >= 5 && (idx < 1 || idx > props.routes.length - 3)) || state.isShown;

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
    .menu {
        word-break: break-all;
    }
    .link {
        @apply text-xs text-gray-700 cursor-pointer;

        &:hover {
            @apply text-gray-900 underline;
        }
    }
    .current-page {
        @apply text-xs text-gray-900 cursor-default;
        > .p-copy-button {
            font-size: inherit;
            margin-left: 0.25rem;
            vertical-align: 0.1rem;
        }
    }
    .arrow-icon {
        @apply text-gray-500;
        margin-left: 0.375rem;
        margin-right: 0.375rem;
    }
}
</style>
