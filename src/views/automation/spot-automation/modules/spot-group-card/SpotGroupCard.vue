<template>
    <article class="card-wrapper">
        <div class="card-header">
            <div class="left-wrapper">
                <p class="project-group-nav">
                    <span class="project-group-info">Project Group</span>
                    <p-i name="ic_breadcrumb_arrow" width="0.75rem" height="0.75rem"
                         class="project-group-info opacity-50" color="inherit white"
                    />
                    <span class="project-info">Project</span>
                </p>
                <p class="spot-group-title">
                    Spot Group Name
<!--                    <favorite-button :item-id="item.spot_group_id|| ''"-->
<!--                                     favorite-type="cloudServiceType"-->
<!--                                     resource-type="inventory.CloudServiceType"-->
<!--                                     class="favorite-btn"-->
<!--                    />-->
                </p>
            </div>
            <div class="right-wrapper">
                <span class="spot-group-region-date">
                    <span class="opacity-50 mr-2">리전</span>
                    Asia Pacific (Singapore) ap-southeast-1
                    <span class="opacity-50 mr-2 ml-4">생성</span>
                    2020-12-18 00:00:00
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
        <p-divider />
        <div class="card-body">
            <spot-group-card-desktop class="card-desktop-version" />
            <spot-group-card-mobile class="card-mobile-version" />
        </div>
        <div class="card-footer">
            <span class="footer-region">
                <span class="opacity-50 mr-2">리전</span>
                Asia Pacific (Singapore) ap-southeast-1
                <span class="opacity-50 mr-2 ml-4">생성</span>
                2020-12-18 00:00:00
            </span>
        </div>
    </article>
</template>

<script lang="ts">
import { PDivider, PI } from '@spaceone/design-system';
import SpotGroupCardDesktop from '@/views/automation/spot-automation/modules/spot-group-card/SpotGroupCardDesktop.vue';
import SpotGroupCardMobile from '@/views/automation/spot-automation/modules/spot-group-card/SpotGroupCardMobile.vue';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';

export default {
    name: 'SpotGroupCard',
    components: {
        SpotGroupCardDesktop,
        SpotGroupCardMobile,
        FavoriteButton,
        PDivider,
        PI,
    },
    setup() {
        return {

        };
    },
};
</script>

<style lang="postcss" scoped>
.card-header {
    @apply text-white;
    background: linear-gradient(90.01deg, #315ED1 0.01%, #5DA3F5 99.99%);
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
}
.card-body {
    @apply border border-gray-200;
    width: 100%;
    height: 11.6rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    .card-desktop-version {
        display: none;
    }

    @screen sm {
        height: 7.3125rem;
    }

    @screen md {
        height: 19.15rem;
        .card-mobile-version {
            display: none;
        }
        .card-desktop-version {
            display: flex;
            height: 100%;
        }
    }

    @screen lg {
        height: 19.125rem;
        .card-mobile-version {
            display: none;
        }
        .card-desktop-version {
            display: flex;
            height: 100%;
        }
    }

}
.card-footer {
    @apply bg-blue-100 border border-gray-200;
    display: flex;
    justify-content: center;
    height: 3.25rem;
    border-top: 0;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

    .footer-region {
        @apply text-gray-500;
        font-size: 0.75rem;
        align-self: center;
    }

    @screen sm {
        height: 2.125rem;
    }

    @screen md {
        height: 2.125rem;
    }

    @screen lg {
        display: none;
    }
}
</style>
