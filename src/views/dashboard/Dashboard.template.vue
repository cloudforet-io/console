<template>
    <general-page-layout>
        <p-row class="dashboard" wrap="wrap" justify-content="center">
            <p-col :flex-grow="0">
                <Summary class="item" :data="summaryData" />
            </p-col>
            <p-col :flex-grow="0">
                <div class="item flex">
                    <ResourcesByRegion class="region"
                                       :data="resourcesByRegionData"
                    />
                    <ServerState class="server-state"
                                 :data="serverStateData"
                    />
                </div>
            </p-col>
            <p-col :flex-grow="0">
                <ServersByType class="item"
                               :server-data="serverTypeData"
                               :vm-data="vmTypeData"
                               :os-data="osTypeData"
                               :hypervisor-data="hypervisorTypeData"
                />
            </p-col>
        </p-row>
    </general-page-layout>
</template>

<script>
import { toRefs, reactive } from '@vue/composition-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import Summary from '@/views/dashboard/modules/Summary.vue';
import ServerState from '@/views/dashboard/modules/ServerState.vue';
import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion.vue';
import ServersByType from '@/views/dashboard/modules/ServersByType.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';

export const setup = () => {
    const state = reactive({
        summaryData: {},
        resourcesByRegionData: {},
        serverStateData: {},
        serverTypeData: {},
        vmTypeData: {},
        osTypeData: {},
        hypervisorTypeData: {},
    });

    return {
        ...toRefs(state),
    };
};

export default {
    name: 'Dashboard',
    components: {
        PCol,
        PRow,
        GeneralPageLayout,
        Summary,
        ServerState,
        ResourcesByRegion,
        ServersByType,
    },
    setup(props, context) {
        return setup(props, context);
    },
};
</script>

<style lang="scss" scoped>
    .dashboard {
        width: 100%;
        .item {
            min-width: calc(1200px - #{$gnb-width});
            max-width: 1280px;
            margin-bottom: 1rem;
            &.flex {
                display: flex;
                width: 100%;
                .region {
                    width: calc(75% + .5rem);
                    margin-right: 1rem;
                }
                .server-state {
                    width: calc(25% - .5rem);
                }
            }
        }
    }
</style>
