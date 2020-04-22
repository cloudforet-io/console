<template>
    <div class="flex flex-wrap no-gutters">
        <project-summary class="item" :selected-node="selectedNode" :data="summaryData" />
        <servers-by-type class="flex-grow"
                         :server-data="serverByType.serverTypeData"
                         :vm-data="serverByType.vmTypeData"
                         :os-data="serverByType.osTypeData"
                         :hypervisor-data="serverByType.hypervisorTypeData"
                         :col-max="2"
                         :draw-by="drawBy"
        />
        <resources-by-region class="flex-grow region"
                             :data="resourcesByRegionData"
                             :loading="regionLoading"
                             legend-position="bottom"
                             :draw-by="drawBy"
        />
    </div>
</template>
<script>

import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion';
import ServersByType from '@/views/dashboard/modules/ServersByType';
import ProjectSummary from '@/views/project/project/origin/ProjectSummary';

export default {
    name: 'Bottom',
    components: {
        ProjectSummary,
        ResourcesByRegion,
        ServersByType,
    },
    props: {
        selectedNode: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            summaryData: {},
            serverByType: {
                serverTypeData: {},
                vmTypeData: {},
                osTypeData: {},
                hypervisorTypeData: {},
            },
            resourcesByRegionData: {},
            regionLoading: true,
        };
    },
    computed: {
        drawBy() {
            return { project_id: this.selectedNode.node.data.id };
        },
    },
    mounted() {
        this.initSummaryData();
        this.getResourcesByRegionData();
        this.getServerByTypeData();
    },
    methods: {
        async initSummaryData() {
            const selectedNodeDT = this.selectedNode.node.data;
            try {
                const summaryData = await this.$http.post('/statistics/project-summary', { project_id: selectedNodeDT.id });
                this.summaryData = summaryData.data;
            } catch (e) {
                console.error(e);
            }
        },
        async getResourcesByRegionData() {
            this.regionLoading = true;
            const selectedNodeDT = this.selectedNode.node.data;
            try {
                const serverDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'server_type' });
                const vmTypeDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'vm_type' });
                const osTypeDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'os_type' });
                const hypervisorTypeDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'hypervisor_type' });

                this.serverByType = {
                    serverTypeData: serverDT.data,
                    vmTypeData: vmTypeDT.data,
                    osTypeData: osTypeDT.data,
                    hypervisorTypeData: hypervisorTypeDT.data,
                };
            } catch (e) {
                console.error(e);
            } finally {
                this.regionLoading = false;
            }
        },
        async getServerByTypeData() {
            this.regionLoading = true;
            const selectedNodeDT = this.selectedNode.node.data;
            try {
                const resourceTypeDT = await this.$http.post('/statistics/datacenter-items', { project_id: selectedNodeDT.id, item_type: 'server' });
                this.resourcesByRegionData = resourceTypeDT.data;
            } catch (e) {
                console.error(e);
            } finally {
                this.regionLoading = false;
            }
        },
    },
};
</script>

<style lang="postcss" scoped>
    .summary {
    margin-bottom: 1rem;
    }
    .region {
        margin-left: 1rem;
    }

  .quote {
    border-left: 0.5em solid #415ee1;
    padding: 0.5em;
    padding-left: 12px;
    margin: 8px 0px;
    margin-left: 10px;
  }

  .card.base {
    margin-top: 10px;
    margin-bottom: 10px;
    &.summary {
      margin-top: 0;
      border-top-left-radius: 0px !important;
    }
  }

</style>
