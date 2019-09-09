<template>
  <div>
    <b-form @reset.prevent="onReset" 
            @submit.prevent="onSubmit"
    >
      <b-row>
        <b-col cols="6">
          <BaseField v-model="userId" 
                     :plaintext="!creatable" 
                     :state="validateUserId"
                     :label="`${tr('USER.ID')} : `"
                     :label-cols="3"
                     :placeholder="tr('USER.ID')"
                     autocomplete="off"
                     required
                     :description="isLocalUser ? tr('FORM.INVALID.LENGTH', [tr('USER.ID'), 5, 12]) : null"
                     :valid-message="tr('FORM.VALID.AVAIL')"
                     :invalid-message="getUserValidMessage()"
                     @input="changedUserId"
          >
            <template v-if="creatable" #append>
              <b-button v-if="isLocalUser" variant="light"
                        :disabled="!validateUserIdLength"
                        @click="checkIdAvailability"
              >
                {{ tr('BTN_AVAIL') }}
              </b-button>
              <b-button v-else variant="light"
                        @click="findUser"
              >
                {{ tr('BTN_FIND') }}
              </b-button>
            </template>
          </BaseField>

          <BaseField v-if="creatable && isLocalUser" 
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

          <BaseField v-if="creatable && isLocalUser" 
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

          <BaseField v-if="!creatable || !isLocalUser" 
                     v-model="language" 
                     :label="`${tr('USER.LANG')} : `"
                     :label-cols="3"
                     :field-cols="5"
                     type="select"
                     :options="languageList"
                     :placeholder="tr('FORM.SELECT', [tr('USER.LANG')])"
          />
    

          <BaseField v-if="!creatable || !isLocalUser" 
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
          <BaseField v-if="creatable && isLocalUser" 
                     v-model="language" 
                     :label="`${tr('USER.LANG')} : `"
                     :label-cols="3"
                     label-class="col-xl-2"
                     :field-cols="5"
                     type="select"
                     :options="languageList"
                     :placeholder="tr('FORM.SELECT', [tr('USER.LANG')])"
          />
    

          <BaseField v-if="creatable && isLocalUser" 
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
const userModel = {
    user_id: null,
    name: null,
    password: null,
    email: null,
    mobile: null,
    group: null,
    language: null,
    timezone: null,
    tags: {}
};

export default {
    name: 'UserDetail',
    event: ['create', 'update', 'cancel'],
    components: {
        BaseField,
        BaseTag,
        BaseSimpleModal
    },
    props: {
        userProp: {
            type: Object,
            default: () => (userModel)
        },
        creatable: {
            type: Boolean,
            default: false
        },
        isLocalUser: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            userId: this.userProp.user_id, // required
            password: this.userProp.password, // required
            passwordCheck: null, // required
            name: this.userProp.name,
            email: this.userProp.email,
            mobile: this.userProp.mobile,
            group: this.userProp.group,
            language: this.userProp.language || this.$i18n.locale,
            timezone: this.userProp.timezone || sessionStorage.getItem('timezone'),
            userIdUnique: null,
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
            return this.dictToKeyValueArray(this.userProp.tags);
        },
        validateUserIdLength () {
            return this.validateLength(this.userId, this.showValidation, 5);
        },
        validateUserIdUnique () {
            return this.userIdUnique;
        },
        validateUserId () {
            if (!this.isLocalUser) {
                return null;
            }
            if (this.validateUserIdLength === null) {
                return null;
            }
            return  !!(this.validateUserIdLength && this.validateUserIdUnique);
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
            return !!(this.validateUserId && 
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
            this.resetUserData(this.userProp);
        },
        onSubmit () {
            if (this.validate()) {
                if (this.creatable) {
                    this.createUser();
                } else {
                    this.updateUser();
                }
            }
        },
        showCheckModal () {
            this.$refs.IDUS002_CheckModal.showModal();
        },
        async createUser () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/create', this.getUserData());
                this.$emit('create', res.data);
                this.$alertify.success(this.tr('ALERT.SUCCESS', [this.tr('USER'), this.tr('CRT_PAST')]));
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.SUCCESS', [this.tr('CRT_CONT'), this.tr('USER')]));
            }
        },
        async updateUser () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/update', this.getUserData());
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
                res = await this.$axios.post('/identity/user/list', {
                    user_id: this.userId
                });

                if (res.data.results.length === 0) {
                    this.userIdUnique = true;
                } else {
                    this.userIdUnique = false;
                }
            } catch (e) {
                console.error(e);
            }
        },
        async findUser () {
            console.log('find user');
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/find', {
                    keyword: this.userId
                });
                if (res.data.results[0].state === 'UNIDENTIFIED') {
                    this.onFailFindUser();
                } else {
                    this.resetUserData(res.data.results[0]);
                }
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('FIND_CONT'), this.tr('USER')]));
            }
        },
        onFailFindUser () {
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
                this.resetUserData(userModel); 
            } else { 
                this.resetUserData(this.userProp); 
            }
        },
        validate () {
            this.showValidation = true;
            
            let result = true;
            if (!this.$refs.IDUS002_BaseTag.validate()) {
                result = false;
            }

            if (this.creatable && !this.validateUserId) {
                if (this.creatable) {
                    this.userId = this.userId === null ? '' : this.userId;
                } 
                result = false;  
            }

            if (!this.validatePassword) {
                if (this.creatable) {
                    this.password = this.password === null ? '' : this.password;
                } else {
                    this.password = this.userProp.password;
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
                this.userId = this.userId === null ? '' : this.userId;
                this.password = this.password === null ? '' : this.password;
                this.passwordCheck = this.passwordCheck === null ? '' : this.passwordCheck;
            } else {
                this.userId = this.userProp.user_id;
                this.password = this.userProp.password;
                this.passwordCheck = '';
            }
        },
        onTagRowAdded () {
            this.$refs.IDUS002_BaseTagContainer.scrollTop = this.$refs.IDUS002_BaseTagContainer.scrollHeight;
        },
        changedUserId () {
            this.userIdUnique = null;
        },
        getUserData () {
            return {
                user_id: this.userId,
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
        resetUserData (user) {
            this.userId = user.user_id;
            this.password = user.password;
            this.passwordCheck = null;
            this.name = user.name;
            this.email = user.email;
            this.mobile = user.mobile;
            this.group = user.group;
            this.language = user.language || this.$i18n.locale;
            this.timezone = user.timezone || sessionStorage.getItem('timezone');
            if (this.$refs.IDUS002_BaseTag) {
                this.$refs.IDUS002_BaseTag.resetRows();
            }
        },
        getUserValidMessage () {
            if (!this.validateUserIdLength) {
                return this.tr('FORM.INVALID.LENGTH', [this.tr('USER.ID'), 5, 12]);
            } else if (this.validateUserIdUnique === null) {
                return this.tr('FORM.CHECK.AVAIL');
            } else if (!this.validateUserIdUnique) {
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
