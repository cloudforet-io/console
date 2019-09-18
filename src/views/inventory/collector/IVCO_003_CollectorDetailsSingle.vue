<template>
  <div>
    <BasePanel :panels="panelData"
               @edit="showTagEditModal"
    />
    <BaseTable class="user-table"
               :table-data="filterFormat"
               :dark-header="false"
               :fields="fields"
               :per-page="query.page.limit"
               :searchable="false"
               :total-rows="totalCount"
               :search-context-data="contextData"
               :busy="isLoading"
               :cardless="true"
               underlined
    >
      <template #caption />
    </BaseTable>
    <BaseModal ref="IVCO003_TagEditModal"
               :title="tr('TITLE', [tr('BTN_EDIT'), tr('TAG')])"
               :centered="true"
               size="md"
               type="primary"
               :interactive="true"
               @ok="onEditTags"
               @cancel="hideTagEditModal"
    >
      <template #contents>
        <BaseTag ref="IVCO003_Tags"
                 :tag-data="tags"
                 :editable="true"
                 align="between"
        />
      </template>
    </BaseModal>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import contextData from './search_context/query.js';
const BasePanel = () => import('@/components/base/panel/BAPA_002_BasePanel');
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const BaseTag = () => import('@/components/base/tags/BATG_001_BaseTag');

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
    name: 'CollectorDetailsSingle',
    components: {
        BasePanel,
        BaseModal,
        BaseTable,
        BaseTag
    },
    props: {
        collectorData: {
            type: Object,
            default: () => (collectorModel),
            required: true
        }
    },
    data () {
        return {
            filterFormat: [],
            totalCount: 0,
            query: {
                sort: {},
                page: {
                    start: 1,
                    limit: 10
                },
                filter: [],
                filter_or: []
            },
            isLoading: true,
            contextData: contextData
        };
    },
    computed: {
        fields () {
            return [
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '150px' }},
                { key: 'key', label: this.tr('COL_NM.KEY'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'type', label: this.tr('COL_NM.TYPE'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'resource_type', label: this.tr('COL_NM.RESOURCE'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }}
            ];
        },
        collector () {
            return [
                { title: this.tr('COL_NM.ID'), contents: this.collectorData.collector_id, copyFlag: true },
                { title: this.tr('COL_NM.NAME'), contents: this.collectorData.name, copyFlag: true },
                { title: this.tr('COL_NM.STATE'), state: this.collectorData.state, stateType: 'MEMBER_STATE', copyFlag: true },
                { title: this.tr('COL_NM.PRIORITY'), contents: this.collectorData.priority, copyFlag: true },
                { title: this.tr('COL_NM.RESOURCE'), contents: this.getComputedResourceType(this.collectorData.plugin_info.options.supported_resource_type), copyFlag: true },
                { title: this.tr('COL_NM.DEF_COL_STATE'), contents: this.collectorData.default_collect_state, copyFlag: true },
                { title: this.tr('COL_NM.LAST_COL'), contents: this.getComputedTime(this.collectorData.last_collected_at), copyFlag: true },
                { title: this.tr('COL_NM.CREATED'), contents: this.getComputedTime(this.collectorData.created_at), copyFlag: true }
            ];
        },
        tag () {
            let tag = [];
            for (var key in this.collectorData.tags) {
                tag.push({
                    title: key,
                    contents: this.collectorData.tags[key],
                    copyFlag: true
                });
            }
            return tag;
        },
        tags () {
            return this.dictToKeyValueArray(this.collectorData.tags);
        },
        panelData () {
            return [
                {
                    panelTitle: this.tr('PANEL.BASE_INFO'),
                    panelIcon: { icon: 'fa-hashtag', type: 'l', size: 1, color: 'primary' },
                    data: this.collector
                },
                {
                    panelTitle: this.tr('PANEL.TAG'),
                    panelIcon: { icon: 'fa-tags', type: 'l', size: 1, color: 'danger' },
                    data: this.tag,
                    editable: true
                }
            ];
        }
    },
    mounted(){
        this.setFilterFormatData(this.collectorData);
    },
    methods: {
        getComputedResourceType (selectedResourceType){
            return !this.isEmpty(selectedResourceType) ? selectedResourceType.join(',') : '';
        },
        getComputedTime (selectedTimeStamp) {
            return !this.isEmpty(selectedTimeStamp) ? this.getDatefromTimeStamp(selectedTimeStamp.seconds, localStorage.getItem('timezone')) : '';
        },
        async onEditTags () {
            if (this.$refs.IVCO003_Tags.validate()) {
                let res = null;
                try {
                    res = await this.$axios.post('/inventory/collector/update', {
                        collector_id: this.collectorData.collector_id,
                        tags: this.$refs.IVCO003_Tags.tags
                    });
                    this.hideTagEditModal();
                    this.$emit('update', res.data);
                } catch (e) {
                    console.error(e);
                }
            }
        },
        setFilterFormatData (selectedRow) {
            this.filterFormat = selectedRow.plugin_info.options.filter_format;
            this.totalCount = this.filterFormat.length;
            this.isLoading = false;
        },
        showTagEditModal () {
            this.$refs.IVCO003_TagEditModal.showModal();
        },
        hideTagEditModal () {
            this.$refs.IVCO003_TagEditModal.hideModal();
        }
    }
};
</script>

<style lang="scss" scoped>

</style>