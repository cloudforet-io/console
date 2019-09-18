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
              <b-card class="left-le"
                      align="left"
                      header="Repository"
                      header-bg-variant="primary"
                      header-text-variant="white"
                      >
                <b-form-radio name="radio-size" size="lg">Official</b-form-radio>
                <b-form-radio name="radio-size" size="lg">Public</b-form-radio>
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
                  <b-col class="col-xs-12 col-sm-12 col-md-4">
                      <b-card class="s-card">
                          <b-col  class="sel-collector" cols="12" md="auto">
                              <b-card-img src="data:image/jpeg;base64,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"
                                          style="padding-top: 15%"
                                          height="150vh"
                                          width="150vh"
                              />
                              <b-card style="border: none">
                                 2
                              </b-card>
                          </b-col>
                      </b-card>
                  </b-col>
                  <b-col class="col-xs-12 col-sm-12 col-md-4">
                      <b-card class="s-card">
                          <b-col  class="sel-collector" cols="12" md="auto">
                              <b-card-img src="@/asset/images/brand/dcos.png"
                                          style="padding-top: 15%"
                                          height="150vh"
                                          width="150vh"
                              />
                              <b-card style="border: none">
                                  2
                              </b-card>
                          </b-col>
                      </b-card>
                  </b-col>
                  <b-col class="col-xs-12 col-sm-12 col-md-4">
                      <b-card class="s-card">
                          <b-col  class="sel-collector" cols="12" md="auto">
                              <b-card-img src="@/asset/icons/GEAR.svg"
                                          style="padding-top: 15%"
                                          height="150vh"
                                          width="150vh"
                              />
                              <b-card style="border: none">
                                  2
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
    event: ['create', 'update', 'cancel'],
    components: {
        BaseField,
        BaseTag,
        BaseSimpleModal,
        BaseSearch
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
            picked: null,
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
        heads () {
            return this.fields;
        },
        limit () {
            return this.perPage;
        },
        start () {
            return (this.currentPage - 1) * this.limit;
        },
        maxPage () {
            return Math.ceil(this.totalRows / this.limit);
        },
        noCaption () {
            return !(this.$slots.caption || this.$scopedSlots.caption);
        },
        headerWidth () {
            return this.width - (this.pad * 2);
        },
        captionContainerWidth () {
            return this.captionWidth > this.width ? this.width : this.captionWidth;
        },
        toolContainerWidth () {
            if (this.headerWidth < this.captionContainerWidth + this.toolWidth) {
                return this.headerWidth;
            }
            return this.toolWidth > this.width ? this.width : this.toolWidth;
        },
        toolboxWidth () {
            if (this.toolContainerWidth > this.toolWidth) {
                return `${this.toolWidth}px`;
            }
            return '100%';
        },
        searchContainerWidth () {
            let calculatedWidth;
            debugger;
            if (this.width < 768) {
                calculatedWidth = this.headerWidth;
            } else {
                calculatedWidth = this.headerWidth - this.toolContainerWidth - (this.noCaption ? 0 : this.captionContainerWidth);
            }

            if (this.searchWidth && calculatedWidth < this.searchWidth) {
                calculatedWidth = this.searchWidth;
            }

            return `${calculatedWidth}px`;
        },
        searchboxWidth () {
            if (this.searchWidth) {
                return `${this.searchWidth}px`;
            }
            return '100%';
        }

    },
    created() {
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
        async createCollector () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/collector/create', this.getCollectorData());
                this.$emit('create', res.data);
                this.$alertify.success(this.tr('ALERT.SUCCESS', [this.tr('USER'), this.tr('CRT_PAST')]));
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.SUCCESS', [this.tr('CRT_CONT'), this.tr('USER')]));
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
</style>
