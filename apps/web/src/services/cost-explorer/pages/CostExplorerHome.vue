<script lang="ts" setup>
import { PLink, PButton, PPaneLayout } from '@cloudforet/mirinae';


import { i18n } from '@/translations';

const SERVICE_CONTENTS = {
    service_name: i18n.t('MENU.COST_EXPLORER'),
    topic: {
        title: i18n.t('BILLING.COST_MANAGEMENT.HOME.TITLE'),
        description: i18n.t('BILLING.COST_MANAGEMENT.HOME.TOPIC_DESC'),
        button_link: 'https://spaceone.megazone.io/contact',
        button_text: i18n.t('BILLING.COST_MANAGEMENT.HOME.CONTACT_BUTTON'),
        link: 'https://cloudforet.io/docs/guides/cost-explorer/',
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
            name: i18n.t('MENU.COST_EXPLORER_BUDGET'),
            description: i18n.t('BILLING.COST_MANAGEMENT.HOME.COST_BUDGET_DESC'),
            link_text: i18n.t('BILLING.COST_MANAGEMENT.HOME.LEARN_MORE'),
            link: 'https://cloudforet.io/docs/guides/cost-explorer/budget/',
            thumbnail_url: 'img_landing_cost-explorer_budget.png',
        },
    ],
};

</script>

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
                        action-icon="external-link"
                        :href="SERVICE_CONTENTS.topic.link"
                        highlight
                >
                    {{ SERVICE_CONTENTS.topic.link_text }}
                </p-link>
            </div>
            <div class="image-wrapper">
                <img class="image"
                     src="@/assets/images/landing/img_landing_cost-explorer_hero.png"
                     :alt="SERVICE_CONTENTS.topic.description"
                >
            </div>
        </div>
        <p-pane-layout class="sub-menu-list">
            <div class="sub-menu-card">
                <div class="sub-menu-contents">
                    <h3>{{ SERVICE_CONTENTS.sub_menu[0].name }}</h3>
                    <p class="description">
                        {{ SERVICE_CONTENTS.sub_menu[0].description }}
                    </p>
                    <p-link :text="SERVICE_CONTENTS.sub_menu[0].link_text"
                            action-icon="external-link"
                            highlight
                            :href="SERVICE_CONTENTS.sub_menu[0].link"
                    />
                </div>
                <div class="image-wrapper">
                    <img src="@/assets/images/landing/img_landing_cost-explorer_cost-analysis.png"
                         :alt="SERVICE_CONTENTS.sub_menu[0].description"
                         class="image"
                    >
                </div>
            </div>
            <div class="sub-menu-card">
                <div class="sub-menu-contents">
                    <h3>{{ SERVICE_CONTENTS.sub_menu[1].name }}</h3>
                    <p class="description">
                        {{ SERVICE_CONTENTS.sub_menu[1].description }}
                    </p>
                    <p-link :text="SERVICE_CONTENTS.sub_menu[1].link_text"
                            action-icon="external-link"
                            highlight
                            :href="SERVICE_CONTENTS.sub_menu[1].link"
                    />
                </div>
                <div class="image-wrapper">
                    <img src="@/assets/images/landing/img_landing_cost-explorer_budget.png"
                         :alt="SERVICE_CONTENTS.sub_menu[1].description"
                         class="image"
                    >
                </div>
            </div>
        </p-pane-layout>
    </div>
</template>

<style lang="postcss" scoped>
.service-home {
    max-width: 90rem;
    width: 100%;
    padding: 0 1.5rem;
    margin: 0 auto;
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
        flex-basis: 50%;
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
        flex-direction: column;
        .service-contents {
            width: 100%;
            text-align: center;
            h2 {
                font-size: 2rem/* 32px */;
                line-height: 1.25;
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
        flex-direction: column;
    }
}

@screen mobile {
    .description {
        width: 100%;
    }
}
</style>
