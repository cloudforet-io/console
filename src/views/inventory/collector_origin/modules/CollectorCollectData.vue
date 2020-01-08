<template>
  <div>
    <b-row>
      <b-col class="col-xs-12 col-sm-12 col-md-4">
        <loading :active.sync="modalLoading"
                 :can-cancel="true"
                 :on-cancel="onCancel"
                 :is-full-page="fullPage"></loading>
        <div>
          <b-card class="s-card" style="border:none;">
            <b-row class="justify-content-md-center">
              <b-col v-if="getSelectedDataIcon" class="sel-collector" cols="12" md="auto">
                <b-card-img :src="require(`@/assets/icons/${getCollectorIcon(collectorData.tags.icon)}`)"
                            style="padding-top:0%;"
                            height="200vh"
                            width="200vh"
                />
                <b-card style="border: none;">
                  <b-row>
                    <b-col cols="4" md="auto" style="text-align: right">
                      Name:
                      <br>
                      Version:
                    </b-col>
                    <b-col cols="8" md="auto" style="text-align: left">
                      <B>{{ collectorData.name }}</B>
                      <br>
                      <B> {{ collectorData.plugin_info.version }} </B>
                    </b-col>
                  </b-row>

                </b-card>

              </b-col>
              <b-col v-else class="sel-collector" cols="12" md="auto">
                <b-card-img :src="require(`@/assets/icons/common-gear.svg`)"
                            style="padding-top: 15%"
                            height="150vh"
                            width="150vh"
                />
                <b-card style="border: none">
                  {{ collectorData.name }}

                </b-card>
              </b-col>
            </b-row>
          </b-card>
          <b-card class="s-card"
                  header="Collector Options"
                  header-bg-variant="primary"
                  header-text-variant="white">
            <div>
              <b-form>
                <b-row>
                  <b-col cols="12" >
                    <BaseField v-model="collector_id"
                               :plaintext="!creatable"
                               :label="`${tr('COL_NM.COL_ID')} : `"
                               :label-cols="5"
                    />

                    <BaseField
                            v-model="credential"
                            :label="`${tr('CREDENTIAL')} : `"
                            :label-cols="5"
                            :options="CollectModeList"
                            :placeholder="'All'"
                    />

                    <BaseField
                            v-model="collect_mode"
                            :label="`${tr('COL_NM.COL_MODE')} : `"
                            :label-cols="5"
                            type="select"
                            :options="CollectModeList"
                            :placeholder="tr('FORM.SELECT', [tr('COL_NM.COL_MODE')])"
                    />
                  </b-col>
                </b-row>
              </b-form>
            </div>
          </b-card>
        </div>
      </b-col>
      <b-col class="col-xs-12 col-sm-12 col-md-8">
        <div>
          <b-card class="m-card" header="Filters"
                  header-bg-variant="primary"
                  header-text-variant="white">
            <div v-for="(item, idx) in filterFormat">
              <BaseField :key="idx"
                         v-model="filterObject.filterInput[item.key]"
                         :label="`${item.name}  : `"
                         :state="filterObject.filterValidation[item.key]"
                         :label-cols="3"
                         :placeholder="replaceFilterFormat(item.type, true)"
                         :invalid-message="tr('ALERT.ALT_CHECK_TYPE', [tr(`FORM.TYPE.${item.type.toUpperCase()}`)])"
              />
            </div>
          </b-card>
        </div>
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
import Loading from 'vue-loading-overlay';

import 'vue-loading-overlay/dist/vue-loading.css';
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
        Loading
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
            modalLoading: false,
            fullPage: true,
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

                /*const credential_group_id = this.collectorData.plugin_info.credential_group_id;
                const credential_id = this.collectorData.plugin_info.credential_id;
                let mergeGroup = [];
                let merge = (a, b, p) => a.filter(aa => ! b.find ( bb => aa[p] === bb[p])).concat(b);

                try {

                    if (!this.isEmpty(credential_group_id)) {
                        let response = await this.getCredentials(credential_group_id, 'credentials-group');
                        if (!this.isEmpty(response.data)){
                            const credentails = response.data.results[0].credentials;
                            mergeGroup = credentails;
                        }
                    }

                    if (!this.isEmpty(credential_id)) {
                        let response = await this.getCredentials(credential_id, 'credentials');
                        if (!this.isEmpty(response.data)){
                            this.tableData = this.isEmpty(mergeGroup) ? response.data.results : merge(mergeGroup, response.data.results, 'credential_id');
                        }
                    }

                    this.totalCount = this.tableData.length;

                } catch (err) {
                    this.alertError(err);
                }*/
            this.isLoading = false;
        },
        reset() {
            this.isLoading = true;
            this.tableData = [];
        },
        async onDataCollect() {
            if (this.validateFilters()){
                this.modalLoading = true;
                await this.$http.post('/inventory/collector/collect', {
                    collector_id: this.collector_id,
                    domain_id:  sessionStorage.getItem('domainId'),
                    filter: this.filterObject.filterInput,
                    collect_mode: this.collect_mode
                }).then((response) => {
                    this.modalLoading = false;
                    this.$alertify.success(this.tr('ALERT.SUCCESS', [this.tr('BTN_COL_DATA'), this.tr('PROCESSED')]));
                    this.$emit('cancel');
                }).catch((error) => {
                    console.error(e);
                    this.modalLoading = false;
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
    }

    .s-card {
        margin: 5px -5px 5px 10px;
    }

    .m-card {
        min-height:  calc(60vh - 30px);
        margin: 5px 10px -5px -5px;
    }
</style>
