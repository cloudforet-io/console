<template>
  <div>
    <b-row>
      <b-col class="col-xs-12 col-sm-12 col-md-4">
        <b-card class="s-card ">
          <div>
            <b-row class="justify-content-md-center">
              <b-col class="sel-collector" cols="12" md="auto">
                <b-card-img :src="require(`@/assets/icons/common-gear.svg`)"
                            style="padding-top: 15%"
                            height="150vh"
                            width="150vh"
                />
                <b-card style="border: none">
                  123123123123213123
                </b-card>
              </b-col>
            </b-row>
          </div>
        </b-card>
        <b-card class="s-card">
          <div>
            <b-form>
              <b-row>
                <b-col cols="12" style="padding-top: 8%">
                  <BaseField v-model="collector_id"
                             :plaintext="!creatable"
                             :label="`${tr('COL_NM.COL_ID')} : `"
                             :label-cols="4"
                  />
                  <BaseField v-model="plugin_info.version"
                             :plaintext="!creatable"
                             :label="`${tr('COL_NM.VERSION')} : `"
                             :label-cols="4"
                  />

                  <BaseField
                    v-model="credential"
                    :label="`${tr('CREDENTIAL')} : `"
                    :label-cols="4"
                    type="select"
                    :options="CollectModeList"
                    :placeholder="tr('FORM.SELECT', [tr('CREDENTIAL')])"
                  />

                  <BaseField
                    v-model="collect_mode"
                    :label="`${tr('COL_NM.COL_MODE')} : `"
                    :label-cols="4"
                    type="select"
                    :options="CollectModeList"
                    :placeholder="tr('FORM.SELECT', [tr('COL_NM.COL_MODE')])"
                  />
                </b-col>
              </b-row>
            </b-form>
          </div>
        </b-card>
      </b-col>
      <b-col class="col-xs-12 col-sm-12 col-md-8">
        <b-card class="m-card">
          <div v-for="(item, idx) in filterFormat">
            <BaseField :key="idx"
                       v-model="filterObject.filterInput[item.key]"
                       :label="`${item.key} (${item.type}) : `"
                       :state="filterObject.filterValidation[item.key]"
                       :label-cols="3"
                       :placeholder="tr('FORM.SELECT', [item.name])"
                       :invalid-message="tr('ALERT.ALT_CHECK_TYPE', [tr(`FORM.TYPE.${item.type.toUpperCase()}`)])"
            />
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="btn-box mt-2 mr-3">
        <b-button class="float-right ml-3 mb-1" size="md" variant="primary" @click="onDataCollect">
          {{ creatable ? tr('BTN_CRT') : tr('BTN_COL_DATA') }}
        </b-button>
        <b-button class="float-right mb-1" size="md"
                  type="button" variant="outline-secondary"
                  @click="onCancel"
        >
          {{ tr('BTN_CANCEL') }}
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import BaseField from '@/components/base/form/BaseField.vue';


const collectorModel = {
    collector_id: null,
    name: null,
    state: null,
    plugin_info: null,
    priority: null,
    resource_type: null,
    default_collect_state: null,
    last_collected_at: null,
    created_at: null,
    tags: []
};

export default {
    name: 'CollectorCollectData',
    components: {
        BaseField,
    },
    props: {
        collectorData: {
            type: Object,
            default: () => (collectorModel),
            required: true
        },
        filterFormatData: {
            type: Array,
            default: () => ([])
        },
        creatable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            filterObject: {
                filterInput: null,
                filterValidation: null,
                filterType: null
            },
            filterFormat: this.collectorData.plugin_info.options.filter_format,
            collector_id: this.collectorData.collector_id,
            name: this.collectorData.name,
            state: this.collectorData.state,
            plugin_info: this.collectorData.plugin_info,
            priority: this.collectorData.priority,
            default_collect_state: this.collectorData.default_collect_state,
            last_collected_at: this.collectorData.last_collected_at,
            created_at: this.collectorData.created_at,
            tags: this.collectorData.tags,
            credential: null,
            tableData: [],
            showValidation: false,
            collect_mode: 'ALL',
            isLoading: true,
            totalCount: 0
        };
    },
    computed: {
        CollectModeList () {
            return this.getCollectModeSelectList();
        },
        getSelectedDataIcon() {
            return this.selectIconType(this.collectorData.tags);
        }
    },
    async created() {
        await this.setFilterFormatObject();
    },
    methods: {
        getCollectorIcon(str){
            return str.includes('svg') ?  str : str + '.svg';
        },
        validateFilters (){
            let validated = true;
            for (let [key, val] of Object.entries(this.filterObject.filterInput)) {
                if (!this.isEmpty(this.filterObject.filterInput[key])){
                    if (!this.isSelectedType(this.filterObject.filterInput[key], this.filterObject.filterType[key])){
                        this.filterObject.filterValidation[key] = false;
                        validated = false;
                    }
                }
            }
            return validated;
        },
        setFilterFormatObject (){
            let filterInput = {};
            let filterValidation = {};
            let filterType = {};

            this.filterFormat.forEach((curItem) =>{
                filterInput[curItem.key] = null;
                filterValidation[curItem.key] = true;
                filterType[curItem.key] = curItem.type;
            });

            this.filterObject =  {
                filterInput: filterInput,
                filterValidation: filterValidation,
                filterType: filterType
            };
        },
        setQuery(limit, start, sort, keyword) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.keyword = keyword || '';
        },
        async listCredentialsData(limit, start, sort, keyword) {

            this.reset();
            this.setQuery(limit, start, sort, keyword);


            this.isLoading = false;
        },
        reset() {
            this.isLoading = true;
            this.tableData = [];
        },
        async onDataCollect() {
            if (this.validateFilters()){
                await this.$axios.post('/inventory/collector/collect', {
                    collector_id: this.collector_id,
                    domain_id:  sessionStorage.getItem('domainId'),
                    filter: this.filterObject.filterInput,
                    collect_mode: this.collect_mode
                }).then((response) => {
                    this.$alertify.success(this.tr('ALERT.SUCCESS', [this.tr('BTN_COL_DATA'), this.tr('PROCESSED')]));
                    this.$emit('cancel');
                }).catch((error) => {
                    console.error(e);
                    this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('BTN_COL_DATA'), this.tr('COLLECTOR')]));
                });
            }
        },
        onCancel() {
            this.$emit('cancel');
        }
    }

};
</script>


<style lang="scss" scoped>
  .sel-collector {
    text-align: center;
    margin-top: 10%;
  }

  .s-card {
    min-height: 30vh;
    margin: 5px -5px 5px 10px;
  }

  .m-card {
    min-height: calc(60vh + 5px);
    margin: 5px 10px -5px -5px;
  }
</style>
