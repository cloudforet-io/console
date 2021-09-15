<template>
    <div class="grid grid-cols-12 gap-4 spot-group-detail-dashboard">
        <spot-group-detail-dashboard-base-info :spot-group="spotGroup" />
        <spot-group-detail-dashboard-interrupt :spot-group-id="spotGroup.spot_group_id" />
        <spot-group-detail-dashboard-monitoring class="col-span-12" :spot-group-id="spotGroup.spot_group_id" />
        <spot-group-detail-dashboard-billing class="col-span-12" :spot-group-id="spotGroup.spot_group_id" />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import SpotGroupDetailDashboardBaseInfo
    from '@/services/automation/spot-automation/spot-group/spot-group-detail/modules/SpotGroupDetailDashboardBaseInfo.vue';
import SpotGroupDetailDashboardInterrupt
    from '@/services/automation/spot-automation/spot-group/spot-group-detail/modules/SpotGroupDetailDashboardInterrupt.vue';
import SpotGroupDetailDashboardBilling
    from '@/services/automation/spot-automation/spot-group/spot-group-detail/modules/SpotGroupDetailDashboardBilling.vue';
import SpotGroupDetailDashboardMonitoring
    from '@/services/automation/spot-automation/spot-group/spot-group-detail/modules/SpotGroupDetailDashboardMonitoring.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';

export default {
    name: 'SpotGroupDetailDashboard',
    components: {
        SpotGroupDetailDashboardMonitoring,
        SpotGroupDetailDashboardBilling,
        SpotGroupDetailDashboardInterrupt,
        SpotGroupDetailDashboardBaseInfo,
    },
    props: {
        spotGroup: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            resourceId: computed(() => props.spotGroup.resource_id),
        });

        const init = () => {
            store.dispatch('resource/project/load');
        };
        init();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.spot-group-detail-dashboard {
    padding: 1.875rem 1rem;
    .spot-group-basic-info {
        @apply col-span-12;
        height: auto;

        @screen md {
            @apply col-span-6;
            height: 25.25rem;
        }

        @screen lg {
            @apply col-span-4;
            height: 25.25rem;
        }
    }
    .spot-group-detail-dashboard-interrupt {
        @apply col-span-12;
        height: 27.5rem;

        @screen md {
            @apply col-span-6;
            height: 25.25rem;
        }

        @screen lg {
            @apply col-span-8;
            height: 25.25rem;
        }
    }
}
</style>
