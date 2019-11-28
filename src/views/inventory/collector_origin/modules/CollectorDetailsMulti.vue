<template>
  <BaseMultiPanel :data="collectors" :data-fields="fields" />
</template>

<script>
import BaseMultiPanel from '@/components/base/panel/BaseMultiPanel';

const collectorModel = {
    collector_id: null,
    name: null,
    state: null,
    email: null,
    priority: null,
    resource_type: null,
    default_collect_state: null,
    last_collected_at: null,
    created_at: null,
    tags: []
};

export default {
    name: 'CollectorDetailsMulti',
    components: {
        BaseMultiPanel
    },
    props: {
        collectorsData: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
        };
    },
    computed: {
        collectors () {
            return this.collectorsData;
        },
        fields () {
            return [
                { key: 'collector_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'email', label: this.tr('COL_NM.EMAIL') },
                { key: 'group', label: this.tr('COL_NM.GROUP') }
            ];
        }
    },
    methods: {
        copyAllToClipboard (key) {
            let result = '';
            this.collectorsData.map((collector) => {
                result += ` ${collector[key]}`;
            });
            this.selectToCopyToClipboard(result);
        }
    }
};
</script>

<style lang="scss" scoped>
  .copy-clipboard {
    vertical-align: baseline;
  }
</style>