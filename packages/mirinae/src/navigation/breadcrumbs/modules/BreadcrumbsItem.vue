<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import type { Location } from 'vue-router';

import PI from '@/foundation/icons/PI.vue';
import { screens } from '@/index';
import PCopyButton from '@/inputs/buttons/copy-button/PCopyButton.vue';
import type { Route } from '@/navigation/breadcrumbs/type';

interface Props {
    route: Route;
    routes: Route[];
    copiable?: boolean;
    idx: number;
}

const props = withDefaults(defineProps<Props>(), {
    route: undefined,
    routes: () => [],
    copiable: false,
    idx: 0,
});

const emit = defineEmits<{(e: 'click'): void}>();

const state = reactive({
    isMobile: false,
});

const getLocation = (route: Route): Location => {
    if (route.to) return route.to;
    if (route.path) return { path: route.path };
    return {};
};
const setMobileSize = () => {
    state.isMobile = window.innerWidth < screens.mobile.max;
};

window.addEventListener('resize', setMobileSize);

onMounted(() => setMobileSize());
</script>

<template>
    <span :class="{'is-mobile': state.isMobile}">
        <span v-if="props.route.to || props.route.path"
              class="breadcrumb"
        >
            <router-link :to="getLocation(props.route)"
                         class="link-wrapper"
            >
                <span v-if="props.idx !== props.routes.length - 1"
                      class="link"
                >{{ props.route.name }}</span>
                <span v-else
                      class="current-page"
                      @click.prevent.stop
                >
                    <span>{{ props.route.name }}</span>
                    <p-copy-button v-if="props.copiable"
                                   :value="props.route.name"
                    />
                </span>
            </router-link>
            <span v-if="props.idx !== props.routes.length - 1">
                <p-i name="ic_chevron-right-thin"
                     width="1rem"
                     height="1rem"
                     class="arrow-icon"
                     color="inherit white"
                />
            </span>
        </span>
        <span v-else
              class="breadcrumb"
        >
            <span v-if="props.idx !== props.routes.length - 1"
                  class="link"
                  @click="emit('click')"
            >{{ props.route.name }}</span>
            <span v-else
                  class="current-page"
            >
                <span>{{ props.route.name }}</span>
                <p-copy-button v-if="props.copiable"
                               :value="props.route.name"
                />
            </span>
            <span v-if="props.idx < props.routes.length - 1">
                <p-i name="ic_chevron-right-thin"
                     width="1rem"
                     height="1rem"
                     class="arrow-icon"
                     color="inherit white"
                />
            </span>
        </span>
    </span>
</template>

<style scoped lang="postcss">
.breadcrumb {
    @apply flex items-center;
    gap: 0.375rem;
    .link-wrapper {
        @apply truncate;
    }
    .link {
        @apply text-label-md text-gray-700 cursor-pointer;

        &:hover {
            @apply text-gray-900 underline;
        }
    }
    .current-page {
        @apply text-label-md text-gray-900 cursor-default truncate;
        > .p-copy-button {
            font-size: inherit;
            margin-left: 0.25rem;
            vertical-align: 0.1rem;
        }
    }
    .arrow-icon {
        @apply text-gray-500;
    }
}
.is-mobile {
    .breadcrumb {
        max-width: 10.5rem;
    }
}
</style>
