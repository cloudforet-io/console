<template>
    <div class="wrap">
        <p-breadcrumbs :routes="route" class="page-navigation" />
        <p-page-title :title="$t('COMMON.ERROR.NO_RESOURCE_TITLE')" child class="page-title"
                      @goBack="$router.go(-1)"
        />
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
        <div class="fnb">
            <f-n-b />
        </div>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PLottie, PButton, PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';

import FNB from '@/common/modules/FNB.vue';

export default {
    name: 'NoResource',
    components: {
        PPageTitle,
        PBreadcrumbs,
        PButton,
        PLottie,
        FNB,
    },
    props: {
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            resourceRoute: computed(() => vm.$route.matched[1]),
            serviceRoute: computed(() => vm.$route.matched[2]),
        });

        const routeState = reactive({
            route: computed(() => ([
                { name: state.resourceRoute.meta.label, path: state.resourceRoute.path },
                { name: state.serviceRoute.meta.label, path: state.serviceRoute.path },
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
.page-navigation {
    margin-top: 2rem;
    margin-left: 1.5rem;
}
.page-title {
    margin-left: 1.5rem;
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
.fnb {
    width: 100%;
}
</style>
