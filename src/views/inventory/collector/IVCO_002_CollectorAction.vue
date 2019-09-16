<template>
  <div>
    <b-row>
      <b-col class="col-xs-12 col-sm-3 col-md-3">
        <b-card class="left-container">
          <b-row>
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
            </div>
          </b-row>
          <b-row>
            <b-card class="left-le">
                <b-form-checkbox size="default">Official</b-form-checkbox>
                <b-form-checkbox size="default">Local</b-form-checkbox>
            </b-card>
          </b-row>
          <b-row>
            <b-card class="left-le">
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
          <b-row />
          <b-row>
            Repository
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
