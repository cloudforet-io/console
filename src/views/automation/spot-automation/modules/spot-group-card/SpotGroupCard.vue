<template>
    <article class="card-wrapper">
        <router-link :to="{ name: 'spotGroupDetail',params: {id: cardData.spot_group_id}}">
            <div class="card-header" :class="{'short': isShort}">
                <div class="left-wrapper">
                    <p class="project-group-nav">
                        <span class="project-group-info">{{ projectGroupName }}</span>
                        <p-i name="ic_breadcrumb_arrow" width="0.75rem" height="0.75rem"
                             class="project-group-info opacity-50" color="inherit white"
                        />
                        <span class="project-info">{{ projectName }}</span>
                    </p>
                    <p class="spot-group-title">
                        {{ cardData.name }}
                        <favorite-button :item-id="cardData.spot_group_id"
                                         favorite-type="spotGroup"
                                         resource-type="spot_automation.SpotGroup"
                        />
                    </p>
                </div>
                <div class="right-wrapper">
                    <div class="spot-group-cost-wrapper">
                        <div class="spot-group-cost-text">
                            <p>절감비용</p>
                            <span class="text-xs">이번달 1일 ~ 어제</span>
                        </div>
                        <span class="spot-group-cost"><span class="text-2xl font-normal">$</span>125</span>
                    </div>
                </div>
            </div>
            <div class="card-body" :class="{'short': isShort}">
                <spot-group-card-desktop
                    v-if="!cardDataLoading"
                    class="card-desktop-version"
                    :card-data="cardData"
                    :is-short="isShort"
                />
                <spot-group-card-mobile
                    v-if="!cardDataLoading"
                    :card-data="cardData"
                    class="card-mobile-version"
                />
                <div v-else class="loading-spinner">
                    <p-lottie name="thin-spinner" :size="2.5"
                              auto class="h-full"
                    />
                </div>
            </div>
            <div class="card-footer" :class="{'short': isShort}">
                <span class="footer-region">
                    <span class="opacity-50 mr-2">리전</span>
                    {{ cardData.region_code }}
                    <span class="opacity-50 mr-2 ml-4">생성</span>
                    {{ cardData.created_at }}
                </span>
            </div>
        </router-link>
    </article>
</template>

<script lang="ts">
import { PI, PLottie } from '@spaceone/design-system';
import SpotGroupCardDesktop from '@/views/automation/spot-automation/modules/spot-group-card/SpotGroupCardDesktop.vue';
import SpotGroupCardMobile from '@/views/automation/spot-automation/modules/spot-group-card/SpotGroupCardMobile.vue';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import { reactive, toRefs } from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';


export default {
    name: 'SpotGroupCard',
    components: {
        SpotGroupCardDesktop,
        SpotGroupCardMobile,
        FavoriteButton,
        PI,
        PLottie,
    },
    props: {
        cardData: {
            type: Object,
            default: () => ({}),
        },
        isShort: {
            type: Boolean,
            default: false,
        },
        cardDataLoading: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const state = reactive({
            projectName: '',
            projectGroupName: '',
            loading: true,
            spotGroupId: props.cardData.spot_group_id,
        });
        const getProjectName = async () => {
            state.loading = true;
            try {
                const project = await SpaceConnector.client.identity.project.get({
                    project_id: props.cardData.project_id,
                });
                state.projectName = project.name;
                state.projectGroupName = project.project_group_info.name;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await getProjectName();
        })();
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.card-wrapper {
    @apply border border-gray-200;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    border-radius: 0.25rem;
    &:hover {
        @apply bg-blue-100 border-blue-500;
    }
    max-width: 58rem;
}

.card-header {
    @apply text-white;
    background: linear-gradient(90.01deg, #315ed1 0.01%, #5da3f5 99.99%);
    display: flex;
    flex-direction: column;
    padding: 1rem 1.5rem;
    width: 100%;
    height: 6.75rem;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;

    @screen sm {
        height: 4.75rem;
        flex-direction: row;
        justify-content: space-between;
    }

    @screen md {
        height: 4.75rem;
    }

    .left-wrapper {
        flex-direction: column;
        flex-grow: 0;
        max-width: 100%;

        @screen sm {
            max-width: 50%;
        }

        @screen lg {
            max-width: 66.6%;
        }

        .spot-group-title {
            @apply truncate;
            display: block;
            max-width: 100%;
            padding-right: 3.71rem;

            /* todo: star -> absolute */
            font-size: 0.875rem;
            line-height: 115%;
            font-weight: bold;
            margin-top: 0.25rem;

            @screen sm {
                font-size: 1.25rem;
                line-height: 120%;
            }
        }
    }
    .project-group-nav {
        font-size: 0.75rem;
        line-height: 130%;
        .project-group-info {
            display: none;

            @screen md {
                display: inline-flex;
            }
        }
    }
    .spot-group-region-date {
        display: none;
    }
    .spot-group-cost-wrapper {

        display: flex;
        justify-content: space-between;
        .spot-group-cost-text {
            align-self: center;
            font-size: 0.875rem;
            line-height: 100%;
            padding-right: 2rem;
        }
        .spot-group-cost {
            display: flex;
            font-size: 2.75rem;
            font-weight: bold;
            line-height: 100%;
        }
    }
}

.card-body {
    @apply border-gray-200;
    border-width: 1px;
    border-right: 0;
    border-left: 0;
    width: 100%;
    min-height: 11.6rem;
    .card-desktop-version {
        display: none;
    }

    @screen sm {
        min-height: 7.3125rem;
    }

    @screen md {
        min-height: 8.125rem;
    }

    @screen lg {
        min-height: 254px;
        .card-mobile-version {
            display: none;
        }
        .card-desktop-version {
            display: flex;
            height: 100%;
        }
    }
    .loading-spinner {
        min-height: inherit;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.card-footer {
    @apply bg-blue-100;
    display: flex;
    justify-content: center;
    min-height: 3.25rem;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;

    .footer-region {
        @apply text-gray-500;
        font-size: 0.75rem;
        align-self: center;
    }

    @screen sm {
        min-height: 2.125rem;
    }

    @screen md {
        min-height: 2.125rem;
    }
}
</style>
