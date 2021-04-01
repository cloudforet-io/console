<template>
    <article class="card-wrapper">
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
                </p>
            </div>
            <div class="right-wrapper">
                <span class="spot-group-region-date">
                    <span class="opacity-50 mr-2">리전</span>
                    {{ cardData.region_code }}
                    <span class="opacity-50 mr-2 ml-4">생성</span>
                    {{ cardData.created_at }}
                </span>
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
            <spot-group-card-desktop v-if="!loading"
                                     class="card-desktop-version"
                                     :card-data="cardData"
                                     :cloud-service-data="cloudServiceData"
                                     :is-short="isShort"
            />
            <spot-group-card-mobile v-if="!loading" class="card-mobile-version" />

            <p-lottie v-if="loading" name="thin-spinner" class="loader"
                      auto
                      :size="2.5"
            />
        </div>
        <div class="card-footer" :class="{'short': isShort}">
            <span class="footer-region">
                <span class="opacity-50 mr-2">리전</span>
                {{ cardData.region_code }}
                <span class="opacity-50 mr-2 ml-4">생성</span>
                {{ cardData.created_at }}
            </span>
        </div>
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
    },
    setup(props) {
        const state = reactive({
            projectName: '',
            projectGroupName: '',
            cloudServiceData: {} as any,
            loading: true,
        });
        const getProjectName = async () => {
            const project = await SpaceConnector.client.identity.project.get({
                project_id: props.cardData.project_id,
            });
            state.projectName = project.name;
            state.projectGroupName = project.project_group_info.name;
        };

        const getCloudServiceData = async () => {
            state.loading = true;
            try {
                const cloudServiceData = await SpaceConnector.client.inventory.cloudService.get({
                    // eslint-disable-next-line camelcase
                    cloud_service_id: props.cardData.resource_id,
                });
                state.cloudServiceData.instanceNum = cloudServiceData.data.instances?.length || 0;
                state.cloudServiceData.loadbalancerNum = cloudServiceData.data.load_balancer_arns?.length || 0;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        (async () => {
            await getProjectName();
            await getCloudServiceData();
        })();
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
@define-mixin spread-case-card-header {
    height: 3rem;

    .spot-group-title {
        visibility: hidden;
    }

    .spot-group-region-date {
        display: block;
        font-size: 0.75rem;
        line-height: 130%;
    }

    .spot-group-cost-wrapper {
        display: none;
    }
}

@define-mixin spread-case-card-body {
    min-height: 19.125rem;
    .card-mobile-version {
        display: none;
    }
    .card-desktop-version {
        display: flex;
        height: 100%;
    }
}

@define-mixin spread-case-card-footer {
    display: none;
}

.card-wrapper {
    @apply border border-gray-200;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    border-radius: 0.25rem;
    &:hover {
        @apply bg-blue-100 border-blue-500;
    }
}

.card-header {
    @apply text-white;
    background: linear-gradient(90.01deg, #315ed1 0.01%, #5da3f5 99.99%);
    display: flex;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    width: 100%;
    height: 6.75rem;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;

    .left-wrapper {
        flex-direction: column;
        .spot-group-title {
            display: block;
            font-size: 0.875rem;
            line-height: 115%;
            font-weight: bold;
            margin-top: 0.25rem;

            @screen md {
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
            font-size: 2.75rem;
            font-weight: bold;
            line-height: 100%;
        }
    }

    @screen sm {
        height: 4.75rem;
    }

    @screen md {
        height: 4.75rem;
    }

    @screen lg {

        &:not(.short) {
            @mixin spread-case-card-header;
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
        min-height: 20rem;
        .card-mobile-version {
            display: none;
        }
        .card-desktop-version {
            display: flex;
            height: 100%;
        }
        &:not(.short) {
            @mixin spread-case-card-body;
        }
    }
    .loader {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 10%;
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

    @screen lg {

        &:not(.short) {
            @mixin spread-case-card-footer;
        }
    }
}
</style>
