<template>
    <article class="card-wrapper">
        <div class="card-header">
            <div class="left-wrapper">
                <p class="project-group-nav">
                    Project Group > .. > Project
                </p>
                <p class="spot-group-title">
                    Spot Group Name
                </p>
            </div>
            <div class="right-wrapper">
                <p class="spot-group-region">
                    Asia Pacific (Singapore) ap-southeast-1
                </p>
                <p class="spot-group-cost">
                    Cost
                </p>
            </div>
        </div>
        <p-divider />
        <div class="card-body">
            <spot-group-card-desktop class="card-desktop-version" />
            <spot-group-card-mobile class="card-mobile-version" />
        </div>
        <div class="card-footer">
            Asia Pacific (Singapore) ap-southeast-1
        </div>
    </article>
</template>

<script lang="ts">
import { PDivider } from '@spaceone/design-system';
import SpotGroupCardDesktop from '@/views/automation/spot-automation/modules/SpotGroupCardDesktop.vue';
import SpotGroupCardMobile from '@/views/automation/spot-automation/modules/SpotGroupCardMobile.vue';

export default {
    name: 'SpotGroupCard',
    components: {
        SpotGroupCardDesktop,
        SpotGroupCardMobile,
        PDivider,
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
        }
    }

    .spot-group-region {
        display: none;
    }
    .spot-group-cost {
        display: block;
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
        .spot-group-region {
            display: block;
        }
        .spot-group-cost {
            display: none;
        }
    }
}
.card-body {
    @apply border border-gray-200;
    width: 100%;
    height: 11.6rem;
    padding: 1.5rem;
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
        }
    }

    @screen lg {
        height: 19.125rem;
        .card-mobile-version {
            display: none;
        }
        .card-desktop-version {
            display: flex;
        }
    }

}
.card-footer {
    @apply bg-blue-100 border border-gray-200;
    display: flex;
    height: 3.25rem;
    border-top: 0;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

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
