<template>
    <div class="wrap">
        <div class="error">
            <div class="error-contents">
                <p-lottie class="flex items-center justify-center"
                          name="lottie_floating-astronaut" auto
                          :size="20"
                />
                <p class="error-message">
                    {{ $t('COMMON.ERROR.NO_RESOURCE_MSG') }}
                </p>
                <router-link :to="serviceRoute.path">
                    <p-button style-type="primary" class="redirect-button">
                        Go To {{ serviceRoute.meta.label }} Main
                    </p-button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PLottie, PButton,
} from '@spaceone/design-system';
import { startCase } from 'lodash';

export default {
    name: 'NoResource',
    components: {
        PButton,
        PLottie,
    },
    props: {
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            resourceRoute: computed(() => vm.$route.matched[1]),
            serviceRoute: computed(() => vm.$route.matched[2]),
        });

        const routeState = reactive({
            route: computed(() => ([
                { name: startCase(state.resourceRoute.path.split('/').pop()), path: state.resourceRoute.path },
                { name: startCase(state.serviceRoute.path.split('/').pop()), path: state.serviceRoute.path },
                { name: 'No Resources' },
            ])),
        });

        return {
            ...toRefs(state),
            ...toRefs(routeState),
        };
    },
};
</script>

<style lang="postcss" scoped>
.wrap {
    @apply flex flex-col;
    height: 100%;
}
.error {
    @apply m-auto flex-1 text-center;
    .error-contents {
        padding-top: calc(50% - 2.5rem);
        .error-message {
            @apply text-lg;
            line-height: 150%;
            a {
                @apply text-blue-700;
            }
        }
        .redirect-button {
            margin-top: 2rem;
        }
    }
}
</style>
