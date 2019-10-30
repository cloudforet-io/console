<script>
import LNBTemplate from '@/views/containers/lnb/LNB.template.vue';

export default {
    name: 'InventoryNavBar',
    extends: LNBTemplate,
    data() {
        return {
            serviceGroup: 'Inventory',
            services: [
                { path: '/inventory/data-center', label: 'Data Center', name: 'dataCenter' },
                { path: '/inventory/server', label: 'Server', name: 'server' },
                { path: '/inventory/collector', label: 'Collector', name: 'collector' },
            ],
        };
    },
};
</script>
