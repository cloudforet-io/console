<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { RouteConfig } from 'vue-router';
import { useRoute } from 'vue-router/composables';

import { PButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

const route = useRoute();
const state = reactive({
    serviceRoute: computed(() => route.matched[route.matched.length - 2]),
    mainLabel: computed(() => {
        const meta: RouteConfig['meta'] = state.serviceRoute.meta;
        if (!meta) return '';
        if (typeof meta.label === 'string') return meta.label;
        if (typeof meta.label === 'function') return meta.label(route);
        if (meta.menuId) {
            const menuInfo = MENU_INFO_MAP[meta.menuId];
            return menuInfo ? i18n.t(menuInfo.translationId) : '';
        }
        if (meta.translationId) return i18n.t(meta.translationId);
        return '';
    }),
});
</script>

<template>
    <div class="wrap">
        <div class="error">
            <div class="error-contents">
                <lottie-vue-player autoplay
                                   loop
                                   src="/lottiefiles/lottie_floating-astronaut.json"
                                   :style="{ height: '20rem', width: '20rem', backgroundColor: 'transparent' }"
                />
                <p class="error-message">
                    {{ $t('COMMON.ERROR.NO_RESOURCE_MSG') }}
                </p>
                <router-link :to="state.serviceRoute.path">
                    <p-button style-type="primary"
                              class="redirect-button"
                    >
                        {{ $t('COMMON.ERROR.NO_RESOURCE_GO_MAIN', {service: state.mainLabel}) }}
                    </p-button>
                </router-link>
            </div>
        </div>
    </div>
</template>

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
