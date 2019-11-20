<template>
    <div class="dashboard-container">
        <main>
            <ResourcesByRegion class="resources-by-region" :data="resourcesByRegionData" />
            <ServerState class="server-state" :data="serverStateData" />
        <!--                            <Summary title="Summary" />-->
        <!--                            <CollectionState />-->
        <!--                            <ServersByType />-->
        </main>
    </div>
</template>

<script>
import { toRefs, computed, reactive } from '@vue/composition-api';
import Summary from '@/views/dashboard/modules/Summary';
import CollectionState from '@/views/dashboard/modules/CollectionState';
import ServerState from '@/views/dashboard/modules/ServerState';
import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion';
import ServersByType from '@/views/dashboard/modules/ServersByType';

export const setup = (props, context) => {
    const state = reactive({
        resourcesByRegionData: {},
        serverStateData: {},
    });
    return {
        ...toRefs(state),
    };
};

export default {
    name: 'Dashboard',
    components: {
        Summary,
        CollectionState,
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
        display: flex;
        width: 100%;
        min-width: calc(1200px - #{$gnb-width});
        max-width: 1280px;
        .resources-by-region {
            width: 100%;
        }
        .server-state {
            margin-left: 1.25rem;
            min-width: 250px;
            max-width: 280px;
            width: 100%;
        }
    }
}
</style>
