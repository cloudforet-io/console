<template>
  <div>
    <BaseModal ref="IVCO002_CollectorActionModal"
               :title="tr('TITLE', [isCreateMode ? tr('BTN_ADD') : tr('BTN_EDIT'), tr('COLLECTOR')])"
               centered
               :use-custom-msg="true"
               backdrop-off
               prevent-esc-close
               size="xl"
               interactive
               hide-footer
               :type="'primary'"
               @esc="hideCollectorActionPopupModal"
               @cancel="hideCollectorActionPopupModal"
    >
      <template #contents>
        <CollectorActionsPopup ref="IVCO001_CollectorData"
                               :creatable="isCreateMode ? true : false"
                               size="xl"
        />
      </template>
    </BaseModal>
    <b-row>
      <b-col class="col-xs-12 col-sm-3 col-md-3">
        <b-card class="left-container">
          <b-row>
            <div ref="IVCO002_SearchboxContainer"
                 class="searchbox-container"
                 style="width:100%"
            >
              <div class="searchbox" :style="{ width: searchboxWidth }">
                <BaseSearch ref="search"
                            :context-data="contextData"
                            :is-empty-search="true"
                            :plain-search="false"
                            :border="true"
                            @search="onSearch"
                            @empty="$emit('empty')"
                />
              </div>
            </div>
          </b-row>
          <b-row>
            <b-card class="left-le" align="left" header="Repository" header-bg-variant="primary"
                    header-text-variant="white"
            >
              <b-form-radio v-model="repositoryData.selectedRepo" name="radio-size" size="lg"
                            value="OFFICIAL" @change="listCollectPlugin"
              >
                {{ tr('PANEL.OFFICIAL') }}
              </b-form-radio>
              <b-form-radio v-model="repositoryData.selectedRepo" name="radio-size" size="lg"
                            value="LOCAL" @change="listCollectPlugin"
              >
                {{ tr('PANEL.LOCAL') }}
              </b-form-radio>
            </b-card>
          </b-row>
          <b-row>
            <b-card class="left-le"
                    header="Resource Type"
                    header-bg-variant="primary"
                    header-text-variant="white"
            >
              <b-form-checkbox size="default">
                ALL
              </b-form-checkbox>
              <br>
              <b-form-checkbox size="default">
                Server
              </b-form-checkbox>
              <br>
              <b-form-checkbox size="default">
                Network
              </b-form-checkbox>
              <br>
              <b-form-checkbox size="default">
                Subnet
              </b-form-checkbox>
              <br>
              <b-form-checkbox size="default">
                IP Address
              </b-form-checkbox>
            </b-card>
          </b-row>
        </b-card>
      </b-col>
      <b-col class="col-xs-12 col-sm-9 col-md-9">
        <b-card class="right-container">
          <b-row>
            <b-col class="btn-box mt-2 mr-3">
              <b-button class="float-left mb-3"
                        size="md"
                        type="reset"
                        variant="primary"
                        @click="onCreatePlugIn"
              >
                {{ tr('BTN_CRT') }}
              </b-button>
              <b-button class="float-left ml-3"
                        size="md"
                        type="reset"
                        variant="outline-secondary"
                        @click="onCancel"
              >
                {{ tr('BTN_CANCEL') }}
              </b-button>
            </b-col>
          </b-row>
          <b-row>
            <b-col v-for="(plugIn, idx) in getPlugInList" class="col-xs-12 col-sm-12 col-md-4">
              <b-card style="cursor: pointer"
                      :class="{ active: plugInList.plugInDataSelected.selected_id == plugIn.plugin_id }"
                      :header="`${plugIn.name.substring(0, plugIn.name.indexOf('-')).toUpperCase()}`"
                      component-type="'plug_in'"
                      header-bg-variant="warning"
                      header-text-variant="white"
                      @click="selectPlugIn(plugIn.plugin_id, idx)"
              >
                <b-col class="sel-collector" cols="12" md="auto">
                  <b-card-img :key="idx"
                              class="p-raido mb-3"
                              :value="plugIn.plugin_id"
                              :src="require(`@/assets/icons/${getCollectorIcon(plugIn.image)}`)"
                              height="100vh"
                              width="100vh"
                  />
                  <b-form>
                    <b-form-radio v-model="plugInList.plugInDataSelected.selected_id"
                                  class="mb-3"
                                  :value="plugIn.plugin_id"
                    >
                      {{ plugIn.name }}
                    </b-form-radio>
                    <BaseField v-model="plugInList.plugInDataSelected.selected_version[replaceAll(plugIn.plugin_id, '-', '_')]"
                               :label="`${tr('COL_NM.VERSION')} : `"
                               :label-cols="3"
                               type="select"
                               :options="getPlugInDropDown(idx)"
                               :placeholder="tr('FORM.SELECT', [tr('COL_NM.COL_MODE')])"
                    />
                  </b-form>
                </b-col>
              </b-card>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseTag from '@/components/base/tags/BaseTag.vue';
import BaseField from '@/components/base/form/BaseField.vue';
import BaseSearch  from '@/components/base/search/BaseSearch.vue';
import BaseModal  from '@/components/base/modal/BaseModal';
import CollectorActionsPopup  from '@/views/inventory/collector/modules/CollectorActionPopup';
import contextData from '@/views/inventory/collector/search-context/query.js';

const collectorModel = {
    collector_id: null,
    priority: null,
    plugin_info: null,
    schedule: null,
    domain_id: null,
    last_collected_at: null,
    created_at: null,
    tags: {}
};

export default {
    name: 'CollectorActions',
    components: {
        BaseTag,
        BaseField,
        BaseSearch,
        contextData,
        CollectorActionsPopup,
        BaseModal
    },
    props: {
        collectorProp: {
            type: Object,
            default: () => (collectorModel)
        },
        creatable: {
            type: Boolean,
            default: false
        },
        isLocalCollector: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            isCreateMode: true,
            plugInList:{
                plugInData: [],
                plugInDataSelected: {
                    selected_id: null,
                    selected_version: {}
                }
            },
            repositoryData: {
                selectedRepo: 'OFFICIAL',
                selectedRepoCollector: 'abs'
            },
            contextData: contextData,
            collectorId: this.collectorProp.collector_id, // required
            name: this.collectorProp.name,
            collectorIdUnique: null,
            showValidation: false
        };
    },
    computed: {
        getPlugInList () {
            return this.plugInList.plugInData;
        },
        getPlugInDropDown () {
            return (index) => {
                return this.plugInList.plugInData[index]['plugin_ver'];
            };
        },
        searchboxWidth () {
            if (this.searchWidth) {
                return `${this.searchWidth}px`;
            }
            return '100%';
        }
    },
    created() {
        this.listCollectPlugin();
    },
    methods: {
        selectPlugIn(plugin_id){
            console.log(plugin_id);
            console.log('plugin_id', this.plugInList.plugInDataSelected.selected_version[this.replaceAll(plugin_id, '-', '_')]);
            this.plugInList.plugInDataSelected.selected_id = plugin_id;
        },
        getCollectorIcon (v) {
            let imageAdd = v;
            if (imageAdd.includes('/')){
                imageAdd = v.substring(v.indexOf('/')+1, v.length);
            }
            return imageAdd.includes('.svg') ? imageAdd : imageAdd + '.svg';
        },
        reSetDatalist () {
            this.plugInList.plugInData = [];
            this.plugInList.plugInRowCount = 0;
        },
        async listCollectPlugin (selectedVal) {
            let remoteRepo = null;
            try {

                this.reSetDatalist();
                if (this.isEmpty(selectedVal) || selectedVal === 'OFFICIAL' ){
                    remoteRepo = await this.$axios.post('/repository/remote-repository/list', {
                        domain_id: sessionStorage.getItem('domainId')
                    });

                    if (remoteRepo.data.total_count > 0){
                        const repository_remote_id = remoteRepo.data.results[0].remote_repository_id;
                        let gotPlugInList = await this.$axios.post('/repository/plugin/list', {
                            domain_id: sessionStorage.getItem('domainId'),
                            repository_id: repository_remote_id,
                            service_type: 'inventory.collector'
                        });

                        if (!this.isEmpty(gotPlugInList.data.results)){
                            const plugInArr = gotPlugInList.data.results;

                            for (const [index, curItem] of plugInArr.entries()) {
                                const newKey = this.replaceAll(curItem.plugin_id, '-', '_');
                                let versionInfo  = await this.$axios.post('/repository/plugin/get-versions', {
                                    domain_id: sessionStorage.getItem('domainId'),
                                    plugin_id: curItem.plugin_id
                                });

                                if (!this.isEmpty(versionInfo.data.version)) {
                                    this.plugInList.plugInDataSelected.selected_version[newKey] = versionInfo.data.version[0];
                                    gotPlugInList.data.results[index]['plugin_versions'] = versionInfo.data.version;
                                    gotPlugInList.data.results[index]['plugin_version_count'] = versionInfo.data.total_count;
                                    gotPlugInList.data.results[index]['plugin_ver'] = this.createComboBox(versionInfo.data.version);
                                }
                            }
                            this.plugInList.plugInData = gotPlugInList.data.results;
                        }

                    }
                }

            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.SUCCESS', [this.tr('UPT_CONT'), this.tr('USER')]));
            }

        },
        createComboBox (versionArr){
            let returnVal = [];
            if (versionArr.length > 0) {
                const arr = versionArr.map(Number);
                const indexOfMaxValue = arr.indexOf(Math.max(...arr));
                versionArr.forEach(function(curItem, index){
                    returnVal.push ({
                        value :  curItem,
                        text:  (index == indexOfMaxValue) ? `Latest version: ${curItem}` : curItem
                    });
                });
            }
            return returnVal;
        },
        hideCollectorActionPopupModal () {
            this.$refs.IVCO002_CollectorActionModal.hideModal();
        },
        showCollectorActionPopupModal () {
            this.$refs.IVCO002_CollectorActionModal.showModal();
        },
        onCreatePlugIn () {
            this.isCreateMode = true;
            this.showCollectorActionPopupModal();
        },
        onSearch (){

        },
        onCancel () {
            this.$router.push({ path: '/inventory/collector' });
        }
    }
};
</script>

<style lang="scss" scoped>
    .p-raido {
      margin: 0px 5px 5px 5px;
    }

    .sel-collector {
        text-align: center;
    }

    .left-le {
        width: 100%;
        margin: 5px 5px 5px 5px;
        height: 39vh
    }
    .left-container {
        min-height: calc(100vh - #{$total-header-height} - 10px);
        margin: 5px -5px 5px 10px;
    }
    .right-container {
        min-height: calc(100vh - #{$total-header-height} - 10px);
        margin: 5px 10px 5px -5px;
    }

    .searchbox-container {
        margin: 5px 5px 5px 5px;
        &.no-caption {
            text-align: right;
        }
        .searchbox {
            display: inline-block;
        }
    }
    .row-gears {

    }
    .active {
        background: linear-gradient(  to top, #ffbeac, #FFAE08);
        color: white;
    }
</style>
