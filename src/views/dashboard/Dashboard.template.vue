<template>
    <div class="dashboard-container">
        <main>
            <div class="flex-row">
                <Summary class="item" :data="summaryData" />
            </div>
            <div class="flex-row">
                <div class="item flex">
                    <ResourcesByRegion class="region"
                                       :data="resourcesByRegionData"
                    />
                    <ServerState class="server-state"
                                 :data="serverStateData"
                    />
                </div>
            </div>
            <div class="flex-row">
                <ServersByType class="item"
                               :server-data="serverTypeData"
                               :vm-data="vmTypeData"
                               :os-data="osTypeData"
                               :hypervisor-data="hypervisorTypeData"
                />
            </div>
        </main>
    </div>
</template>

<script>
import { toRefs, reactive } from '@vue/composition-api';
import Summary from '@/views/dashboard/modules/Summary';
import ServerState from '@/views/dashboard/modules/ServerState';
import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion';
import ServersByType from '@/views/dashboard/modules/ServersByType';

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
.dashboard-container {
    display: flex;
    padding: 2rem 2rem 1rem 2rem;
    justify-content: center;
    main {
        width: 100%;
        min-width: calc(1200px - #{$gnb-width});
        max-width: 1280px;
        .flex-row {
            display: flex;
            padding-bottom: 1rem;
            width: 100%;
            .item {
                width: 100%;
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

    }
}
</style>
