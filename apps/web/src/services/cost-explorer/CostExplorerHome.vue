<template>
    <div class="service-home">
        <div class="service-topic">
            <div class="service-contents">
                <span class="name">{{ SERVICE_CONTENTS.service_name }}</span>
                <h2>{{ SERVICE_CONTENTS.topic.title }}</h2>
                <div class="description">
                    {{ SERVICE_CONTENTS.topic.description }}
                </div>
                <p-button
                    style-type="primary"
                    :href="SERVICE_CONTENTS.topic.button_link"
                    target="_blank"
                >
                    {{ SERVICE_CONTENTS.topic.button_text }}
                </p-button>
                <br>
                <p-link text="More information"
                        :action-icon="ACTION_ICON.EXTERNAL_LINK"
                        :href="SERVICE_CONTENTS.topic.link"
                        highlight
                >
                    {{ SERVICE_CONTENTS.topic.link_text }}
                </p-link>
            </div>
            <div class="image-wrapper">
                <img class="image"
                     :src="`/src/assets/images/landing/${SERVICE_CONTENTS.topic.thumbnail_url}`"
                     :alt="SERVICE_CONTENTS.topic.description"
                >
            </div>
        </div>
        <p-pane-layout class="sub-menu-list">
            <div v-for="(submenu, index) in SERVICE_CONTENTS.sub_menu"
                 :key="`${submenu}-${index}`"
                 class="sub-menu-card"
            >
                <div class="sub-menu-contents">
                    <h3>{{ submenu.name }}</h3>
                    <p class="description">
                        {{ submenu.description }}
                    </p>
                    <p-link :text="submenu.link_text"
                            :action-icon="ACTION_ICON.EXTERNAL_LINK"
                            highlight
                            :href="submenu.link"
                    />
                </div>
                <div class="image-wrapper">
                    <img :src="`/src/assets/images/landing/${submenu.thumbnail_url}`"
                         :alt="submenu.description"
                         class="image"
                    >
                </div>
            </div>
        </p-pane-layout>
    </div>
</template>

<script lang="ts">
import { PLink, PButton, PPaneLayout } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { i18n } from '@/translations';

const SERVICE_CONTENTS = {
    service_name: i18n.t('MENU.COST_EXPLORER'),
    topic: {
        title: i18n.t('BILLING.COST_MANAGEMENT.HOME.TITLE'),
        description: i18n.t('BILLING.COST_MANAGEMENT.HOME.TOPIC_DESC'),
        button_link: 'https://help.spaceone.megazone.com/hc/ko',
        button_text: i18n.t('BILLING.COST_MANAGEMENT.HOME.ENABLE_BUTTON'),
        link: 'https://help.spaceone.megazone.com/hc/ko',
        link_text: i18n.t('BILLING.COST_MANAGEMENT.HOME.MORE_INFO'),
        thumbnail_url: 'img_landing_cost-explorer_hero.png',
    },
    sub_menu: [
        {
            name: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'),
            description: i18n.t('BILLING.COST_MANAGEMENT.HOME.COST_ANALYSIS_DESC'),
            link_text: i18n.t('BILLING.COST_MANAGEMENT.HOME.LEARN_MORE'),
            link: 'https://cloudforet.io/docs/guides/cost-explorer/cost-analysis/',
            thumbnail_url: 'img_landing_cost-explorer_cost-analysis.png',
        },
        {
            name: i18n.t('BILLING.COST_MANAGEMENT.HOME.COST_DASHBOARD'),
            description: i18n.t('BILLING.COST_MANAGEMENT.HOME.COST_DASHBOARD_DESC'),
            link_text: i18n.t('BILLING.COST_MANAGEMENT.HOME.LEARN_MORE'),
            link: 'https://cloudforet.io/docs/guides/cost-explorer/dashboard/',
            thumbnail_url: 'img_landing_cost-explorer_dashboard.png',
        },
        {
            name: i18n.t('MENU.COST_EXPLORER_BUDGET'),
            description: i18n.t('BILLING.COST_MANAGEMENT.HOME.COST_BUDGET_DESC'),
            link_text: i18n.t('BILLING.COST_MANAGEMENT.HOME.LEARN_MORE'),
            link: 'https://cloudforet.io/docs/guides/cost-explorer/budget/',
            thumbnail_url: 'img_landing_cost-explorer_budget.png',
        },
    ],
};

export default {
    name: 'CostExplorerHome',
    components: {
        PPaneLayout,
        PLink,
        PButton,
    },
    setup() {
        return {
            SERVICE_CONTENTS,
            ACTION_ICON,
        };
    },
};
</script>
<style lang="postcss" scoped>
.service-home {
    max-width: 90rem;
    width: 100%;
    padding: 0 1.5rem;
    margin: 0 auto;
    background: url('@/assets/images/landing/img_landing_cost-explorer_background.png') no-repeat 50% 0 / 90rem auto;
}
.service-topic {
    @apply flex;
    padding: 4rem 0;
    .service-contents {
        width: 50%;
        padding: 1.5rem 0;
        .name {
            @apply text-label-xl font-bold;
        }
        h2 {
            @apply text-display-xl font-medium;
            margin: 1rem 0 0.5rem;
        }
        .description {
            @apply text-paragraph-lg text-gray-600;
            max-width: 22.75rem;
        }
        .p-button {
            margin: 1.5rem 0;
        }
    }
    .image-wrapper {
        @apply flex justify-center items-center;
        width: 50%;
        .image {
            max-width: 31.375rem;
        }
    }
}
.sub-menu-list {
    @apply flex gap-4;
    padding: 1rem;
    .sub-menu-card {
        @apply overflow-hidden relative bg-primary-4 rounded-md;
        flex-basis: 33.33%;
        min-height: 21.5625rem;
        .sub-menu-contents {
            min-height: 9.5625rem;
            margin: 0 1.5rem;
            padding-top: 1.125rem;
            h3 {
                @apply text-label-lg font-bold;
            }
            .description {
                @apply text-paragraph-md text-gray-600;
                max-width: 20rem;
                margin: 0.5rem 0;
            }
            .p-link {
                @apply text-label-sm;
            }
        }
        .image-wrapper {
            position: absolute;
            left: 1.5rem;
            bottom: 0;
            width: 40rem;
        }
    }
}

@screen laptop {
    .service-topic {
        .image-wrapper {
            .image {
                width: 90%;
            }
        }
    }
}

@screen tablet {
    .service-topic {
        @apply flex-col;
        .service-contents {
            width: 100%;
            text-align: center;
            h2 {
                @apply text-display-lg;
            }
        }
        .image-wrapper {
            width: 100%;
        }
        .description {
            margin: 0 auto;
        }
    }
    .sub-menu-list {
        @apply flex-col;
    }
}

@screen mobile {
    .description {
        width: 100%;
    }
}
</style>
