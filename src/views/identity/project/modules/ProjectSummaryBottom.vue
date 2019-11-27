<template>
    <div class="row no-gutters">
        <project-summary class="item" :selected-node="selectedNode" :data="summaryData" />
        <servers-by-type class="col"
                         :server-data="serverByType.serverTypeData"
                         :vm-data="serverByType.vmTypeData"
                         :os-data="serverByType.osTypeData"
                         :hypervisor-data="serverByType.hypervisorTypeData"
                         :col-max="2"
                         :draw-by="drawBy"
        />
        <resources-by-region class="col region"
                             :data="resourcesByRegionData"
                             legend-position="bottom"
                             :draw-by="drawBy"
        />
    </div>
</template>
<script>

import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion';
import ServersByType from '@/views/dashboard/modules/ServersByType';
import ProjectSummary from '@/views/identity/project/modules/ProjectSummary';

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
        };
    },
    computed: {
        drawBy() {
            return { project_id: this.selectedNode.node.data.id };
        },
    },
    mounted() {
        this.initSummaryData();
        this.getServerByTypeData();
    },
    methods: {
        async initSummaryData() {
            const selectedNodeDT = this.selectedNode.node.data;
            try {
                const summaryData = await this.$http.post('/statistics/summary', { project_id: selectedNodeDT.id });
                const memberData = await this.$http.post('/identity/project/member/list', { project_id: selectedNodeDT.id });
                const cardData = summaryData.data;
                delete cardData.project;
                cardData.members = memberData.data.total_count;
                this.summaryData = cardData;
            } catch (e) {
                console.error(e);
            }
        },
        async getServerByTypeData() {
            const selectedNodeDT = this.selectedNode.node.data;
            try {
                const serverDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'server_type' });
                const vmTypeDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'vm_type' });
                const osTypeDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'os_type' });
                const hypervisorTypeDT = await this.$http.post('/statistics/server-type', { project_id: selectedNodeDT.id, item_type: 'hypervisor_type' });

                this.serverByType =  {
                    serverTypeData: serverDT.data,
                    vmTypeData: vmTypeDT.data,
                    osTypeData: osTypeDT.data,
                    hypervisorTypeData: hypervisorTypeDT.data,
                };
            } catch (e) {
                console.error(e);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
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
