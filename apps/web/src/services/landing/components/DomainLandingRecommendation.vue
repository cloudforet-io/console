<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PLink, PDivider, PCard, PButton, PI, screens,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';

const router = useRouter();

const { width } = useWindowSize();

const storeState = reactive({
    language: computed(() => store.state.user.language),
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
});
const state = reactive({
    isTabletSize: computed(() => width.value < screens.tablet.max),
    isMobileSize: computed(() => width.value < screens.mobile.max),
    isXsSize: computed(() => width.value < 478),
    adminCardType: computed(() => ([
        {
            type: 'quick-start-guide',
            title: i18n.t('LADING.DOMAIN.QUICK_GUIDE_TITLE'),
            desc: i18n.t('LADING.DOMAIN.QUICK_GUIDE_DESC'),
            button: i18n.t('LADING.DOMAIN.QUICK_GUIDE_BUTTON'),
            image: '/images/domain-landing/domain-landing_asset-inventory.png',
            srcSet: '/images/domain-landing/domain-landing_asset-inventory@2x.png 2x, /images/domain-landing/domain-landing_asset-inventory@3x.png 3x',
        },
        {
            type: 'role-type',
            title: i18n.t('LADING.DOMAIN.ROLE_TYPE_TITLE'),
            desc: i18n.t('LADING.DOMAIN.ROLE_TYPE_DESC'),
            button: i18n.t('LADING.DOMAIN.ROLE_TYPE_BUTTON'),
            image: '/images/domain-landing/domain-landing_admin_role-type.png',
            srcSet: '/images/domain-landing/domain-landing_admin_role-type@2x.png 2x, /images/domain-landing/domain-landing_admin_role-type@3x.png 3x',
        },
        {
            type: 'auto-sync',
            title: i18n.t('LADING.DOMAIN.AUTO_SYNC_TITLE'),
            desc: i18n.t('LADING.DOMAIN.AUTO_SYNC_DESC'),
            button: i18n.t('LADING.DOMAIN.AUTO_SYNC_BUTTON'),
            image: '/images/domain-landing/domain-landing_admin_auto-sync.png',
            srcSet: '/images/domain-landing/domain-landing_admin_auto-sync@2x.png 2x, /images/domain-landing/domain-landing_admin_auto-sync@3x.png 3x',
        },
    ])),
    userCardType: computed(() => ([
        {
            type: 'inventory',
            title: i18n.t('LADING.DOMAIN.INVENTORY_TITLE'),
            desc: i18n.t('LADING.DOMAIN.INVENTORY_DESC'),
            image: '/images/domain-landing/domain-landing_asset-inventory.png',
            srcSet: '/images/domain-landing/domain-landing_asset-inventory@2x.png 2x, /images/domain-landing/domain-landing_asset-inventory@3x.png 3x',
        },
        {
            type: 'cost-explorer',
            title: i18n.t('LADING.DOMAIN.COST_EXPLORER_TITLE'),
            desc: i18n.t('LADING.DOMAIN.COST_EXPLORER_DESC'),
            image: '/images/domain-landing/domain-landing_cost-explorer.png',
            srcSet: '/images/domain-landing/domain-landing_cost-explorer@2x.png 2x, /images/domain-landing/domain-landing_cost-explorer@3x.png 3x',
        },
        {
            type: 'out-of-the-box-dashboard',
            title: i18n.t('LADING.DOMAIN.OUT_OF_THE_BOX_DASHBOARD_TITLE'),
            desc: i18n.t('LADING.DOMAIN.OUT_OF_THE_BOX_DASHBOARD_DESC'),
            image: '/images/domain-landing/domain-landing_out-of-the-box-dashboard.png',
            srcSet: '/images/domain-landing/domain-landing_out-of-the-box-dashboard@2x.png 2x, /images/domain-landing/domain-landing_out-of-the-box-dashboard@3x.png 3x',
        },
    ])),
    cardType: computed(() => (storeState.isDomainAdmin ? state.adminCardType : state.userCardType)),
});

const handleClickCardButton = (type: string) => {
    let url = '';

    if (type === 'quick-start-guide') {
        url = `https://cloudforet.io/${storeState.language}/docs/guides/admin-mode/getting-started`;
    } else if (type === 'role-type') {
        url = router.resolve({
            name: makeAdminRouteName(IAM_ROUTE.ROLE._NAME),
        }).href;
    } else if (type === 'auto-sync') {
        url = router.resolve({
            name: makeAdminRouteName(ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME),
        }).href;
    }

    if (url) {
        window.open(url, '_blank');
    }
};
</script>

<template>
    <div class="domain-landing-recommendation">
        <div class="title-wrapper">
            <h2>{{ state.isTabletSize ? $t('LADING.DOMAIN.RECOMMENDED_TITLE_SHORT') : $t('LADING.DOMAIN.RECOMMENDED_TITLE') }}</h2>
            <p-link :text="i18n.t('LADING.DOMAIN.HELP_LINK')"
                    :href="`https://help.spaceone.megazone.com/hc/${storeState.language}`"
                    size="md"
                    highlight
                    action-icon="external-link"
                    new-tab
                    class="help-link"
            />
        </div>
        <p-divider class="divider" />
        <div class="card-wrapper"
             :class="{'is-user-mode': !storeState.isDomainAdmin}"
        >
            <p-card v-for="(item, idx) in state.cardType"
                    :key="`p-card-${idx}`"
                    :header="false"
                    class="card"
            >
                <div class="card-inner-wrapper">
                    <div class="inner-contents">
                        <p class="title">
                            {{ item.title }}
                        </p>
                        <span class="desc">{{ item.desc }}</span>
                        <div>
                            <p-button v-if="item.button"
                                      style-type="tertiary"
                                      :icon-left="item.type === 'quick-start-guide' ? 'ic_rocket-filled' : undefined"
                                      class="link-button"
                                      @click="handleClickCardButton(item.type)"
                            >
                                <span>
                                    {{ item.button }}
                                </span>
                                <p-i v-if="item.type === 'quick-start-guide'"
                                     name="ic_external-link"
                                     width="1rem"
                                     height="1rem"
                                     color="inherit"
                                     class="info-icon"
                                />
                            </p-button>
                        </div>
                    </div>
                    <img v-if="!state.isXsSize"
                         class="card-image"
                         :src="item.image"
                         :srcset="item.srcSet"
                         alt="card-image"
                    >
                </div>
            </p-card>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.domain-landing-recommendation {
    @apply flex flex-col;
    gap: 0.375rem;
    .title-wrapper {
        @apply flex justify-between;
        .help-link {
            margin-left: auto;
            padding-top: 0.375rem;
        }
    }
    .divider {
        margin-top: 0.375rem;
    }
    .card-wrapper {
        @apply flex overflow-y-auto;
        padding-top: 0.875rem;
        gap: 1rem;

        /* custom design-system component - p-card */
        :deep(.p-card) {
            .body {
                @apply relative border-none;
                height: 100%;
                padding: 0;
            }
        }

        .card {
            @apply overflow-y-hidden;
            flex: 1;
            min-width: 25rem;
            .card-inner-wrapper {
                @apply relative overflow-hidden border border-gray-200;
                height: 100%;
                padding: 4.375rem 2rem 2rem 2rem;
                border-radius: 0.375rem;
                .inner-contents {
                    @apply relative flex flex-col;
                    height: 100%;
                    z-index: 1;
                    .title {
                        @apply text-label-xl font-medium;
                    }
                    .desc {
                        @apply block text-paragraph-md;
                        max-width: 13rem;
                        flex: 1;
                        margin-top: 0.75rem;
                    }
                    .link-button {
                        @apply flex text-label-md font-bold;
                        gap: 0.25rem;
                        margin-top: 1.5rem;
                    }

                    /* custom design-system component - p-button */
                    :deep(.p-button) {
                        svg {
                            margin: 0;
                        }
                    }
                }
                .card-image {
                    @apply absolute;
                    top: 0;
                    right: 0;
                    width: 25rem;
                    height: 16rem;
                    z-index: 0;
                }
            }
        }

        &.is-user-mode {
            .card {
                .card-inner-wrapper {
                    padding: 6.5rem 2rem 2rem 2rem;
                }
            }
        }
    }

    @screen tablet {
        .card-wrapper {
            @apply flex-col;
            .card {
                .card-inner-wrapper {
                    padding: 1.25rem 1.125rem;
                }
            }
            &.is-user-mode {
                .card {
                    .card-inner-wrapper {
                        height: 11.375rem;
                        padding: 2rem;
                    }
                }
            }
        }
    }

    @media (max-width: 478px) {
        .card-wrapper {
            .card {
                min-width: unset;
            }
        }
    }
}
</style>
