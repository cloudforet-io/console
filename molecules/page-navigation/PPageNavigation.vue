<template>
    <div class="p-page-navigation">
        <span v-for="(route, idx) in routes" :key="idx">
            <span v-if="route.path">
                <router-link
                    v-if="defaultIsShown(idx)" class="menu"
                    :to="getPath(route)"
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
                <div
                    v-if="defaultIsShown(idx)" class="menu"
                >
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
            <span v-if="routes.length>=5&&idx===2&&!isShown">
                <span class="inline-block link" @click="showHidden">...</span>
                <p-i name="ic_breadcrumb_arrow" width="1rem" height="1rem"
                     class="arrow-icon" color="inherit white"
                />
            </span>
        </span>
    </div>
</template>

<script lang="ts">
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'PPageNavigation',
    components: {
        PI,
    },
    props: {
        routes: {
            type: Array,
            default: null,
        },
        isShown: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const getPath = route => `${route.path}`;
        const showHidden = () => { props.isShown = true; };
        const defaultIsShown = idx => props.routes.length < 5 || (props.routes.length >= 5 && (idx < 1 || idx > props.routes.length - 3)) || props.isShown;

        return {
            getPath,
            showHidden,
            defaultIsShown,
        };
    },
};
</script>

<style lang="postcss">
.p-page-navigation {
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
}
</style>
