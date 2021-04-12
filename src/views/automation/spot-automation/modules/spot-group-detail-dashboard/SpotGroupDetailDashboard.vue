<template>
    <div class="grid grid-cols-12 gap-4 spot-group-detail-dashboard">
        <spot-group-base-info :spot-group="spotGroup" />
        <spot-group-interrupt :spot-group-id="spotGroup.spot_group_id" />
        <spot-group-monitoring class="col-span-12" :spot-group-id="spotGroup.spot_group_id" />
        <spot-group-billing class="col-span-12" :spot-group="spotGroup" />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import SpotGroupBaseInfo
    from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupBaseInfo.vue';
import SpotGroupInterrupt
    from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupInterrupt.vue';
import SpotGroupBilling
    from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupBilling.vue';
import SpotGroupMonitoring
    from '@/views/automation/spot-automation/modules/spot-group-detail-dashboard/SpotGroupMonitoring.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';

export default {
    name: 'SpotGroupDetailDashboard',
    components: {
        SpotGroupMonitoring,
        SpotGroupBilling,
        SpotGroupInterrupt,
        SpotGroupBaseInfo,
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
    .spot-group-interrupt {
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
