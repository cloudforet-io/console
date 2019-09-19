<template>
    <div>
        <b-row>
            <b-col class="col-xs-12 col-sm-3 col-md-3">
                <b-card class="left-container">
                    <b-row><!--
            <div ref="IVCO002_SearchboxContainer"
                 class="searchbox-container"
                 :class="{ 'no-caption': noCaption }"
                 style="width:100%"
            >
              <div class="searchbox" :style="{ width: searchboxWidth }">
                <BaseSearch ref="search"
                            :context-data="searchContextData"
                            :is-empty-search="isEmptySearch"
                            :plain-search="plainSearch"
                            :border="!darkHeader"
                            @search="onSearch"
                            @empty="$emit('empty')"
                />
              </div>
            </div>-->
                    </b-row>
                    <b-row>
                        <b-card class="left-le" align="left" header="Repository" header-bg-variant="primary" header-text-variant="white">
                            <b-form-radio  v-model="repositoryData.selectedRepo" name="radio-size" size="lg" value="OFFICIAL" @change="listCollectPlugin">{{tr('PANEL.OFFICIAL')}}</b-form-radio>
                            <b-form-radio  v-model="repositoryData.selectedRepo" name="radio-size" size="lg" value="LOCAL" @change="listCollectPlugin">{{tr('PANEL.LOCAL')}}</b-form-radio>
                        </b-card>
                    </b-row>
                    <b-row>
                        <b-card class="left-le"
                                align="left"
                                header="Resource Type"
                                header-bg-variant="primary"
                                header-text-variant="white">
                            <b-form-checkbox size="default">ALL</b-form-checkbox>
                            <br>
                            <b-form-checkbox size="default">Server</b-form-checkbox>
                            <br>
                            <b-form-checkbox size="default">Network</b-form-checkbox>
                            <br>
                            <b-form-checkbox size="default">Subnet</b-form-checkbox>
                            <br>
                            <b-form-checkbox size="default">IP Address</b-form-checkbox>
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
                            >
                                {{ tr('BTN_CRT') }}
                            </b-button>
                            <b-button class="float-left ml-3"
                                      size="md"
                                      type="reset"
                                      variant="outline-secondary"
                            >
                                {{ tr('BTN_CANCEL') }}
                            </b-button>
                        </b-col>
                    </b-row>
                    <b-row >
                        <b-col class="col-xs-12 col-sm-12 col-md-4" v-for="(plugIn, idx) in getPlugInList" v-if="getPlugInList.length > 0">
                            <b-card class="s-card">
                                <b-col class="sel-collector" cols="12" md="auto">
                                    <b-card-img  class="row-gears"
                                          :src="require(`${getImageURL(plugIn.image)}`)"
                                          height="100vh"
                                          width="100vh"
                                    />
                                    <b-card style="border: none">
                                        {{plugIn.name}}
                                    </b-card>
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
import BaseTag from '@/components/base/tags/BATG_001_BaseTag.vue';
import BaseField from '@/components/base/form/BAFM_001_BaseField.vue';
import BaseSearch  from '@/components/base/search/BASR_001_BaseSearch.vue';
const BaseSimpleModal = () => import('@/components/base/modal/BAMO_002_BaseSimpleModal.vue');
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
            plugInList:{
                plugInData: [],
                plugInRowCount: 0,
            },
            repositoryData: {
                selectedRepo: 'OFFICIAL',
                selectedRepoCollector: 'abs'
            },
            collectorId: this.collectorProp.collector_id, // required
            password: this.collectorProp.password, // required
            passwordCheck: null, // required
            name: this.collectorProp.name,
            email: this.collectorProp.email,
            mobile: this.collectorProp.mobile,
            group: this.collectorProp.group,
            language: this.collectorProp.language || this.$i18n.locale,
            timezone: this.collectorProp.timezone || sessionStorage.getItem('timezone'),
            collectorIdUnique: null,
            showValidation: false,
            noticeTitle: '',
            noticeText: ''
        };
    },
    computed: {
        getPlugInList () {
            return this.plugInList.plugInData;
        }

    },
    created() {
        this.listCollectPlugin();
    },
    methods: {
        init () {
            this.showValidation = false;
            this.resetCollectorData(this.collectorProp);
        },
        onSubmit () {
            if (this.validate()) {
                if (this.creatable) {
                    this.createCollector();
                } else {
                    this.updateCollector();
                }
            }
        },
        showCheckModal () {
            this.$refs.IDUS002_CheckModal.showModal();
        },
        getImageURL (pluginImg) {
            let returnVal = `@/asset/icons/common-gear.svg`;
            if (!this.isEmpty(pluginImg)) {
                pluginImg
            }
            return returnVal;
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
                        this.plugInList.plugInData = this.isEmpty(gotPlugInList.data.results) ? [] : gotPlugInList.data.results;
                        this.plugInList.plugInRowCount = Math.ceil(gotPlugInList.data.total_count/3);
                    }
                }

            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.SUCCESS', [this.tr('UPT_CONT'), this.tr('USER')]));
            }
        },
        async updateCollector () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/collector/update', this.getCollectorData());
                this.$emit('update', res.data);
                this.$alertify.success(this.tr('ALERT.SUCCESS', [this.tr('USER'), this.tr('UPT_PAST')]));
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.SUCCESS', [this.tr('UPT_CONT'), this.tr('USER')]));
            }
        },
        async checkIdAvailability () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/collector/list', {
                    collector_id: this.collectorId
                });

                if (res.data.results.length === 0) {
                    this.collectorIdUnique = true;
                } else {
                    this.collectorIdUnique = false;
                }
            } catch (e) {
                console.error(e);
            }
        },
        async findCollector () {
            console.log('find collector');
            let res = null;
            try {
                res = await this.$axios.post('/identity/collector/find', {
                    keyword: this.collectorId
                });
                if (res.data.results[0].state === 'UNIDENTIFIED') {
                    this.onFailFindCollector();
                } else {
                    this.resetCollectorData(res.data.results[0]);
                }
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('FIND_CONT'), this.tr('USER')]));
            }
        },
        onFailFindCollector () {
            this.noticeTitle = this.tr('USER.FIND.FAILED.TITLE');
            this.noticeText = this.tr('USER.FIND.FAILED.MISSING');
            this.showCheckModal();
        },
        onReset () {
            this.noticeTitle = this.tr('BTN_RESET');
            this.noticeText = this.tr('FORM.CHECK.RESET');
            this.showCheckModal();
        },
        onConfirmReset () {
            this.reset();
        },
        reset () {
            this.showValidation = false;
            if (this.creatable) {
                this.resetCollectorData(collectorModel);
            } else {
                this.resetCollectorData(this.collectorProp);
            }
        },
        validate () {
            this.showValidation = true;

            let result = true;
            if (!this.$refs.IDUS002_BaseTag.validate()) {
                result = false;
            }

            if (this.creatable && !this.validateCollectorId) {
                if (this.creatable) {
                    this.collectorId = this.collectorId === null ? '' : this.collectorId;
                }
                result = false;
            }

            if (!this.validatePassword) {
                if (this.creatable) {
                    this.password = this.password === null ? '' : this.password;
                } else {
                    this.password = this.collectorProp.password;
                }
                result = false;
            }

            if (!this.validatePasswordCheck) {
                if (this.creatable) {
                    this.passwordCheck = this.passwordCheck === null ? '' : this.passwordCheck;
                } else {
                    this.passwordCheck = '';
                }
                result = false;
            }
            return result;
        },
        resetInvalidFields () {
            if (this.creatable) {
                this.collectorId = this.collectorId === null ? '' : this.collectorId;
                this.password = this.password === null ? '' : this.password;
                this.passwordCheck = this.passwordCheck === null ? '' : this.passwordCheck;
            } else {
                this.collectorId = this.collectorProp.collector_id;
                this.password = this.collectorProp.password;
                this.passwordCheck = '';
            }
        },
        onTagRowAdded () {
            this.$refs.IDUS002_BaseTagContainer.scrollTop = this.$refs.IDUS002_BaseTagContainer.scrollHeight;
        },
        changedCollectorId () {
            this.collectorIdUnique = null;
        },
        getCollectorData () {
            return {
                collector_id: this.collectorId,
                password: this.password,
                name: this.name,
                state: this.state,
                email: this.email,
                mobile: this.mobile,
                group: this.group,
                language: this.language,
                timezone: this.timezone,
                tags: this.$refs.IDUS002_BaseTag.tags
            };
        },
        resetCollectorData (collector) {
            this.collectorId = collector.collector_id;
            this.password = collector.password;
            this.passwordCheck = null;
            this.name = collector.name;
            this.email = collector.email;
            this.mobile = collector.mobile;
            this.group = collector.group;
            this.language = collector.language || this.$i18n.locale;
            this.timezone = collector.timezone || sessionStorage.getItem('timezone');
            if (this.$refs.IDUS002_BaseTag) {
                this.$refs.IDUS002_BaseTag.resetRows();
            }
        },
        getCollectorValidMessage () {
            if (!this.validateCollectorIdLength) {
                return this.tr('FORM.INVALID.LENGTH', [this.tr('USER.ID'), 5, 12]);
            } else if (this.validateCollectorIdUnique === null) {
                return this.tr('FORM.CHECK.AVAIL');
            } else if (!this.validateCollectorIdUnique) {
                return this.tr('USER.ID_DUPL');
            }
            return '';
        },
        onCancel () {
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

  .left-le {
    width: 100%;
    margin-bottom: 5px;
    margin-left: 5px;
    margin-right:5px;
    min-height: 40vh
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
    text-align: right;
    margin: 5px 5px 5px 5px;
    &.no-caption {
      text-align: right;
    }
    .searchbox {
      display: inline-block;
      text-align: left;
    }
  }
   .row-gears {
       padding: 5px 5px 5px 5px;
   }
</style>
