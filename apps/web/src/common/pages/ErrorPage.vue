<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.$router.replace({
                query: { previousPage: from.fullPath },
            }).catch(() => {});
        });
    },
});
</script>

<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButton } from '@cloudforet/mirinae';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDomainStore } from '@/store/domain/domain-store';

import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';


interface Props {
    statusCode?: string;
}

const props = withDefaults(defineProps<Props>(), {
    statusCode: '404',
});
const appContextStore = useAppContextStore();
const domainStore = useDomainStore();

const route = useRoute();
const router = useRouter();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

const handleClickBack = () => {
    const previousPage = route.query.previousPage as string;

    if (props.statusCode === '403') {
        router.push({ name: ROOT_ROUTE._NAME });
    } else if (previousPage === '/') {
        handleClickHome();
    } else {
        router.go(-1);
    }
};
const handleClickHome = () => {
    const rootRoute = (props.statusCode === '403' || props.statusCode === '404') ? LANDING_ROUTE.WORKSPACE._NAME : ROOT_ROUTE._NAME;
    const isTokenAlive = SpaceConnector.isTokenAlive;
    if (props.statusCode === '403') {
        if (storeState.isAdminMode) {
            appContextStore.exitAdminMode();
        }
    }
    if (isTokenAlive) router.push({ name: rootRoute });
    else router.push({ name: AUTH_ROUTE.SIGN_OUT._NAME });
};
</script>

<template>
    <section class="page-wrapper">
        <article class="error-contents"
                 :class="{'no-access': props.statusCode === '403'}"
        >
            <img class="error-img"
                 alt="error-img"
                 src="/images/error-octos.gif"
            >
            <h2 class="error-code">
                {{ props.statusCode }}
            </h2>
            <h3 class="error-message">
                <template v-if="props.statusCode === '403'">
                    {{ $t('COMMON.ERROR.403_MSG') }}
                </template>
                <template v-else>
                    {{ $t('COMMON.ERROR.404_MSG') }}
                </template>
            </h3>
            <p v-if="props.statusCode === '403'"
               class="desc"
            >
                {{ $t('COMMON.ERROR.403_MSG_DESC') }}
            </p>
            <div v-if="domainStore.state.name"
                 class="utils-button"
            >
                <p-button style-type="transparent"
                          size="lg"
                          icon-left="ic_arrow-left"
                          @click="handleClickBack"
                >
                    {{ $t('COMMON.ERROR.GO_BACK') }}
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          @click="handleClickHome"
                >
                    {{ $t('COMMON.ERROR.HOME') }}
                </p-button>
            </div>
        </article>
    </section>
</template>

<style lang="postcss" scoped>
.page-wrapper {
    @apply bg-gray-100;
    display: flex;
    height: 100%;

    .error-contents {
        text-align: center;
        margin: auto;
        &.no-access {
            .error-message {
                width: 24.125rem;
                padding-bottom: 0.375rem;
            }
            .desc {
                @apply text-gray-500 text-paragraph-lg;
                padding-bottom: 2.5rem;
            }
        }
        .error-img {
            @apply mx-auto align-middle;
            width: 20rem;
            padding-bottom: 3.5rem;
        }
        .error-code {
            @apply text-primary1;
            font-size: 4rem;
            font-weight: 700;
            line-height: 1.25;
            padding-bottom: 0.5rem;
        }
        .error-message {
            @apply text-violet-400 text-display-sm m-auto;
            width: 18rem;
            padding-bottom: 2.25rem;
        }
        .utils-button {
            @apply flex items-center justify-center;
            gap: 1rem;
        }
    }
}

@screen mobile {
    .page-wrapper {
        .error-contents {
            .error-img {
                width: 60%;
            }
        }
    }
}
</style>
