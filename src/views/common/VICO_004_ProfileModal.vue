<template>
  <span>
    <BaseModal ref="baseModal"
               title="Profile"
               centered
               hide-footer
               backdrop-off
               size="md"
    >
      <template #contents>
        <b-form @reset.prevent="onReset" 
                @submit.prevent="onUpdate"
        >
          <b-row>
            <b-col cols="12">
              <BaseField :value="userId" 
                         plaintext 
                         label="User ID : "
                         :label-cols="3"
                         placeholder="User ID"
                         tabindex="-1"
              />

              <BaseField v-model="name" 
                         label="Name : "
                         :label-cols="3" 
                         placeholder="Name"
              />

              <BaseField v-model="email" 
                         label="E-Mail : " 
                         :label-cols="3"
                         placeholder="Email"
              />

              <BaseField v-model="mobile" 
                         label="Phone : " 
                         :label-cols="3"
                         placeholder="Phone"
              />

              <BaseField v-model="group" 
                         label="Group : " 
                         :label-cols="3" 
                         placeholder="Group"
              />
              <BaseField v-model="language" 
                         label="Language : " 
                         :label-cols="3"
                         :field-cols="5"
                         type="select"
                         :options="languageList"
                         placeholder="Select Language"
              />

              <BaseField v-model="timezone" 
                         label="Time Zone : " 
                         :label-cols="3"
                         :field-cols="9"
                         type="select"
                         :options="timezoneList"
                         placeholder="Select Timezone"
              />

            </b-col>
          </b-row>
          <b-row>
            <b-col class="btn-box mt-5">
              <b-button class="float-right ml-3 mb-1" size="md" type="submit" variant="primary">
                Update
              </b-button>
              <b-button class="float-right mb-1" size="md" 
                        type="button" variant="outline-secondary"
                        @click="onCancel"
              >
                Cancel
              </b-button>
              <b-button class="float-left mb-1" size="md" type="reset" variant="outline-secondary">
                Reset
              </b-button>
            </b-col>
          </b-row>
        </b-form>
      </template>
    </BaseModal>

    <BaseSimpleModal
      ref="checkModal"
      title="Profile Update"
      text="Are you sure you want to update?"
      type="primary"
      :ok-only="false"
      @ok="updateUser"
    />
  </span>
</template>

<script>
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseSimpleModal from '@/components/base/modal/BAMO_002_BaseSimpleModal';
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
        BaseSimpleModal,
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
            this.$refs.baseModal.showModal();
        },
        hideModal () {
            this.$refs.baseModal.hideModal();
        },
        onReset () {
            this.showValidation = false;
            this.resetPassword();
            this.setUser(this.userData);
        },
        onCancel () {
            this.hideModal();
            this.onReset();
        },
        onUpdate () {
            this.showValidation = true;
            this.$refs.checkModal.showModal();   
        },
        async updateUser () {
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/update', this.getUserForUpdate());
                this.userData = res.data;
                this.onReset();
                this.hideModal();
                this.$alertify.success('Profile Successfully Updated.');
            } catch (e) {
                console.error(e);
                this.$alertify.error('ERROR OCCURED during Updating Profile.');
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
                this.$alertify.error('ERROR OCCURED during Getting Profile.');
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