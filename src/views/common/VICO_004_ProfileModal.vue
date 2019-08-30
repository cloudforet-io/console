<template>
  <span>
    <BaseModal ref="VICO004_ProfileModal"
               :title="tr('PROFILE')"
               centered
               hide-footer
               backdrop-off
               size="md"
    >
      <template #contents>
        <b-form @submit.prevent="onUpdate">
          <b-row>
            <b-col cols="12">
              <BaseField :value="userId" 
                         plaintext 
                         :label="`${tr('USER.ID')} : `"
                         :label-cols="3"
                         :placeholder="tr('USER.ID')"
                         tabindex="-1"
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

              <BaseField v-model="language" 
                         :label="`${tr('USER.LANG')} : `"
                         :label-cols="3"
                         :field-cols="5"
                         type="select"
                         :options="languageList"
                         :placeholder="tr('FORM.SELECT', [tr('USER.LANG')])"
              />

              <BaseField v-model="timezone" 
                         :label="`${tr('USER.TIME')} : `"
                         :label-cols="3"
                         :field-cols="9"
                         type="select"
                         :options="timezoneList"
                         :placeholder="tr('FORM.SELECT', [tr('USER.TIME')])"
              />

            </b-col>
          </b-row>
          <b-row>
            <b-col class="btn-box mt-5">
              <b-button class="float-right ml-3 mb-1" size="md" type="submit" variant="primary">
                {{ tr('BTN_UPT') }}
              </b-button>
              <b-button class="float-right mb-1" size="md" 
                        type="button" variant="outline-secondary"
                        @click="hideModal"
              >
                {{ tr('BTN_CANCEL') }}
              </b-button>
            </b-col>
          </b-row>
        </b-form>
      </template>
    </BaseModal>
  </span>
</template>

<script>
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseField from '@/components/base/form/BAFM_001_BaseField.vue';
const userModel = {
    user_id: null,
    name: null,
    password: null, // in case of local user
    email: null,
    mobile: null,
    group: null,
    language: null,
    timezone: null
};
export default {
    name: 'ProfileModal',
    components: {
        BaseModal,
        BaseField
    },
    data() {
        return {
            userData: null,
            userId: sessionStorage.getItem('userId'),
            password: null,
            passwordCheck: null,
            name: userModel.name,
            email: userModel.email,
            mobile: userModel.mobile,
            group: userModel.group,
            language: userModel.language,
            timezone: userModel.timezone,
            isLocalUser: true,
            /**
             * TODO: check whether this user is 'localUser' or not.
             */
            showValidation: false
        };
    },
    computed: {
        languageList () {
            return this.getLanguageSelectList();
        },
        timezoneList () {
            return this.getTimezoneSelectList();
        }
    },
    methods: {
        showModal () {
            this.init();
            this.$refs.VICO004_ProfileModal.showModal();
        },
        hideModal () {
            this.$refs.VICO004_ProfileModal.hideModal();
            this.reset();
        },
        reset () {
            this.showValidation = false;
            this.resetPassword();
            this.setUser(this.userData);
        },
        onUpdate () {
            this.showValidation = true;
            this.updateUser();
        },
        async updateUser () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/update', this.getUserForUpdate());
                this.userData = res.data;
                this.hideModal();
                this.$alertify.success(this.tr('ALERT.SUCCESS', [this.tr('PROFILE'), this.tr('UPT_PAST')]));
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('UPT_CONT'), this.tr('PROFILE')]));
            } 
        },
        async init () {
            this.showValidation = false;
            await this.getUser();
            this.setUser(this.userData);
        },
        async getUser () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/get', {
                    user_id: this.userId
                });
                this.userData = res.data;
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('PROFILE')]));
            }
        },
        setUser (user) {
            this.name = user.name;
            this.email = user.email;
            this.mobile = user.mobile;
            this.group = user.group;
            this.language = user.language;
            this.timezone = user.timezone;
        },
        resetPassword () {
            this.password = null;
            this.passwordCheck = null;
        },
        getUserForUpdate () {
            let user = {
                user_id: this.userId,
                name: this.name,
                email: this.email,
                mobile: this.mobile,
                group: this.group,
                language: this.language,
                timezone: this.timezone
            };

            if (this.isLocalUser) {
                user.password = this.password;
            }
            return user;
        }
    }
};
</script>

<style lang="scss" scoped>

</style>