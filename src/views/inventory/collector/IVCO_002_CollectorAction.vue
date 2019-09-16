<template>
  <div>
    <b-form @reset.prevent="onReset"
            @submit.prevent="onSubmit"
    >
      <b-row>
        <b-col cols="6">
          <BaseField v-model="collectorId"
                     :plaintext="!creatable"
                     :state="validateCollectorId"
                     :label="`${tr('USER.ID')} : `"
                     :label-cols="3"
                     :placeholder="tr('USER.ID')"
                     autocomplete="off"
                     required
                     :description="isLocalCollector ? tr('FORM.INVALID.LENGTH', [tr('USER.ID'), 5, 12]) : null"
                     :valid-message="tr('FORM.VALID.AVAIL')"
                     :invalid-message="getCollectorValidMessage()"
                     @input="changedCollectorId"
          >
            <template v-if="creatable" #append>
              <b-button v-if="isLocalCollector" variant="light"
                        :disabled="!validateCollectorIdLength"
                        @click="checkIdAvailability"
              >
                {{ tr('BTN_AVAIL') }}
              </b-button>
              <b-button v-else variant="light"
                        @click="findCollector"
              >
                {{ tr('BTN_FIND') }}
              </b-button>
            </template>
          </BaseField>

          <BaseField v-if="creatable && isLocalCollector"
                     v-model="password"
                     :state="validatePassword"
                     type="password"
                     :label="`${tr('USER.PWD')} : `"
                     :label-cols="3"
                     :placeholder="tr('USER.PWD')"
                     autocomplete="new-password"
                     required
                     description="Your Password must be 5-12 characters long."
                     valid-message="This is Good."
                     invalid-message="Your Password must be 5-12 characters long."
          />

          <BaseField v-if="creatable && isLocalCollector"
                     v-model="passwordCheck"
                     :label="`${tr('USER.PWD_CHECK')} : `"
                     :label-cols="3"
                     label-align="right"
                     :placeholder="tr('USER.PWD_CHECK')"
                     type="password"
                     :state="validatePasswordCheck"
                     invalid-message="Please check your Password again."
          />

          <BaseField v-model="name"
                     :label="`${tr('USER.NAME')} : `"
                     :label-cols="3"
                     :placeholder="tr('USER.NAME')"
          />

          <BaseField v-model="email"
                     :label="`${tr('USER.EMAIL')} : `"
                     :label-cols="3"
                     :placeholder="tr('USER.EMAIL')"
          />

          <BaseField v-model="mobile"
                     :label="`${tr('USER.PHONE')} : `"
                     :label-cols="3"
                     :placeholder="tr('USER.PHONE')"
          />

          <BaseField v-model="group"
                     :label="`${tr('USER.GROUP')} : `"
                     :label-cols="3"
                     :placeholder="tr('USER.GROUP')"
          />

          <BaseField v-if="!creatable || !isLocalCollector"
                     v-model="language"
                     :label="`${tr('USER.LANG')} : `"
                     :label-cols="3"
                     :field-cols="5"
                     type="select"
                     :options="languageList"
                     :placeholder="tr('FORM.SELECT', [tr('USER.LANG')])"
          />


          <BaseField v-if="!creatable || !isLocalCollector"
                     v-model="timezone"
                     :label="`${tr('USER.TIME')} : `"
                     :label-cols="3"
                     :field-cols="9"
                     type="select"
                     :options="timezoneList"
                     :placeholder="tr('FORM.SELECT', [tr('USER.TIME')])"
          />
        </b-col>
        <b-col cols="6">
          <BaseField v-if="creatable && isLocalCollector"
                     v-model="language"
                     :label="`${tr('USER.LANG')} : `"
                     :label-cols="3"
                     label-class="col-xl-2"
                     :field-cols="5"
                     type="select"
                     :options="languageList"
                     :placeholder="tr('FORM.SELECT', [tr('USER.LANG')])"
          />


          <BaseField v-if="creatable && isLocalCollector"
                     v-model="timezone"
                     :label="`${tr('USER.TIME')} : `"
                     :label-cols="3"
                     label-class="col-xl-2"
                     :field-cols="9"
                     type="select"
                     :options="timezoneList"
                     :placeholder="tr('FORM.SELECT', [tr('USER.TIME')])"
          />

          <b-form-group :label="`${tr('TAG')} : `"
                        :label-cols="3" :label-cols-xl="2"
                        label-align="right"
                        class="mt-4"
          >
            <b-col ref="IDUS002_BaseTagContainer" cols="10" class="tag-container p-0">
              <BaseTag ref="IDUS002_BaseTag"
                       :tag-data="tags"
                       :show-first-tag-row="creatable ? true : false"
                       editable
                       @addedRow="onTagRowAdded"
              />
            </b-col>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="btn-box mt-5">
          <b-button class="float-right ml-3 mb-1" size="md" type="submit" variant="primary">
            {{ creatable ? tr('BTN_CRT') : tr('BTN_UPT') }}
          </b-button>
          <b-button class="float-right mb-1" size="md"
                    type="button" variant="outline-secondary"
                    @click="onCancel"
          >
            {{ tr('BTN_CANCEL') }}
          </b-button>
          <b-button class="float-left mb-1"
                    size="md"
                    type="reset"
                    variant="outline-secondary"
          >
            {{ tr('BTN_RESET') }}
          </b-button>
        </b-col>
      </b-row>
    </b-form>

    <BaseSimpleModal
      ref="IDUS002_CheckModal"
      :title="noticeTitle"
      :text="noticeText"
      type="danger"
      centered
      sm
      ok-only
      @ok="onConfirmReset"
    />
  </div>
</template>

<script>
import BaseTag from '@/components/base/tags/BATG_001_BaseTag.vue';
import BaseField from '@/components/base/form/BAFM_001_BaseField.vue';
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
    name: 'CollectorDetail',
    event: ['create', 'update', 'cancel'],
    components: {
        BaseField,
        BaseTag,
        BaseSimpleModal
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
        languageList () {
            return this.getLanguageSelectList();
        },
        timezoneList () {
            return this.getTimezoneSelectList();
        },
        tags () {
            return this.dictToKeyValueArray(this.collectorProp.tags);
        },
        validateCollectorIdLength () {
            return this.validateLength(this.collectorId, this.showValidation, 5);
        },
        validateCollectorIdUnique () {
            return this.collectorIdUnique;
        },
        validateCollectorId () {
            if (!this.isLocalCollector) {
                return null;
            }
            if (this.validateCollectorIdLength === null) {
                return null;
            }
            return  !!(this.validateCollectorIdLength && this.validateCollectorIdUnique);
        },
        validatePassword () {
            if (!this.creatable) {
                return true;
            }
            return this.validateLength(this.password, this.showValidation, 5);
        },
        validatePasswordCheck () {
            if (!this.creatable) {
                return true;
            }
            return this.validateSameness(this.password, this.showValidation, this.passwordCheck);
        },
        validated () {
            return !!(this.validateCollectorId &&
                this.validatePassword &&
                this.validatePasswordCheck);
        }
    },
    created() {
        this.init();
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
  .input-group {
    .form-control {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .input-group-append {
      .btn {
        border-radius:  0 5px 5px 0;
        border: 1px solid darken($lightgray, 5%);
        &:hover, &:focus {
          box-shadow: 0 0 10px 1px rgba($blue, 0.5);
        }
      }
    }
  }
  .required {
    color: $violet;
  }
  .tag-container {
    height: 260px;
    overflow-y: scroll;
  }
</style>
