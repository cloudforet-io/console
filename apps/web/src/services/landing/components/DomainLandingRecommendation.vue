<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PLink, PDivider, PCard, PButton, PI,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';

const router = useRouter();

const CARD_TYPE = [
    {
        type: 'quick-start-guide',
        title: i18n.t('LADING.DOMAIN.QUICK_GUIDE_TITLE'),
        desc: i18n.t('LADING.DOMAIN.QUICK_GUIDE_DESC'),
        button: i18n.t('LADING.DOMAIN.QUICK_GUIDE_BUTTON'),
        image: '/images/domain-landing/domain-landing_admin_quick-start-guide.png',
        srcSet: '/images/domain-landing/domain-landing_admin_quick-start-guide@2x.png 2x, /images/domain-landing/domain-landing_admin_quick-start-guide@3x.png 3x',
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
];
const storeState = reactive({
    language: computed(() => store.state.user.language),
});

const handleClickCardButton = (type: string) => {
    let url = '';

    if (type === 'quick-start-guide') {
        url = `https://cloudforet.io/${storeState.language}/docs/guides/getting-started/`;
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
        <h2>{{ $t('LADING.DOMAIN.RECOMMENDED_TITLE') }}</h2>
        <p-link :text="i18n.t('LADING.DOMAIN.HELP_LINK')"
                :href="`https://help.spaceone.megazone.com/hc/${storeState.language}`"
                size="md"
                highlight
                action-icon="external-link"
                new-tab
                class="help-link"
        />
        <p-divider class="divider" />
        <div class="card-wrapper">
            <p-card v-for="(item, idx) in CARD_TYPE"
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
                        <p-button style-type="tertiary"
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
                    <img class="card-image"
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
    .help-link {
        margin-left: auto;
    }
    .divider {
        margin-top: 0.375rem;
    }
    .card-wrapper {
        @apply flex overflow-y-auto;
        padding-top: 0.875rem;
        gap: 1rem;

        .card {
            flex: 1;
            min-width: 25rem;
            .card-inner-wrapper {
                @apply relative;
                padding: 3.625rem 1.125rem;
                .inner-contents {
                    @apply relative;
                    z-index: 2;
                    .title {
                        @apply text-label-xl font-medium;
                    }
                    .desc {
                        @apply block text-paragraph-md;
                        max-width: 13rem;
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
                    top: -0.75rem;
                    right: 0.125rem;
                    width: 25rem;
                    height: 16rem;
                    z-index: 1;
                }
            }
        }
    }
}
</style>
