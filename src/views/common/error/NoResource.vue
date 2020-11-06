<template>
    <div class="wrap">
        <p-page-navigation :routes="route" class="page-navigation" />
        <p-page-title :title="'No Resources'" child class="page-title"
                      @goBack="$router.go(-1)"
        />
        <div class="error">
            <div class="error-contents">
                <p-lottie class="flex items-center justify-center"
                          name="lottie_floating-astronaut" auto
                          :size="20"
                />
                <p class="error-message">
                    {{ $t('COMMON.ERROR.NO_RESOURCE_MSG') }}<br> <a href="/dashboard">{{ $t('COMMON.ERROR.NO_RESOURCE_GO_BACK_1') }}</a> {{ $t('COMMON.ERROR.NO_RESOURCE_GO_BACK_2') }}
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
import FNB from '@/views/common/fnb/FNB.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

export default {
    name: 'NoResource',
    components: {
        PPageTitle,
        PPageNavigation,
        PButton,
        PLottie,
        FNB,
    },
    props: {
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            resourceRoute: vm.$route.matched[1],
            serviceRoute: vm.$route.matched[2],
        });

        const routeState = reactive({
            route: [{ name: state.resourceRoute.meta.label, path: state.resourceRoute.path },
                { name: state.serviceRoute.meta.label, path: state.serviceRoute.path },
                { name: 'No Resource', path: `${state.serviceRoute.path}/no-resource` }],
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
