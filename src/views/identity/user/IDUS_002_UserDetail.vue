<template>
  <b-form @reset.prevent="onReset" 
          @submit.prevent="updatable && creatable ? onCreate() : onUpdate()"
  >
    <b-row>
      <b-col cols="6">
        <BaseField v-model="userId" 
                   :plaintext="!creatable" 
                   :state="validateUserId"
                   label="User ID : "
                   label-cols="3"
                   placeholder="User ID"
                   autocomplete="off"
                   required
                   description="Your user ID must be 5-12 characters long."
                   valid-message="This is Available."
                   :invalid-message="getUserValidMessage()"
                   @input="changedUserId"
        >
          <template #append>
            <b-button variant="light"
                      :disabled="!validateUserIdLength"
                      @click="checkIdAvailability"
            >
              Check availability
            </b-button>
          </template>
        </BaseField>

        <BaseField v-if="updatable" 
                   v-model="password" 
                   :state="validatePassword"
                   type="password"
                   label="Password : "
                   label-cols="3"
                   placeholder="Password"
                   autocomplete="new-password"
                   required
                   description="Your Password must be 5-12 characters long."
                   valid-message="This is Good."
                   invalid-message="Your Password must be 5-12 characters long."
        />

        <BaseField v-if="updatable" 
                   v-model="passwordCheck" 
                   label="Password Check : " 
                   :label-cols="3" 
                   label-align="right"
                   placeholder="Password Check"
                   type="password"
                   :state="validatePasswordCheck"
                   invalid-message="Please check your Password again."
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
      </b-col>
      <b-col cols="6">
        <b-form-group label="Language : " 
                      :label-cols="3" :label-cols-xl="2"
                      label-align="right"
        >
          <b-col cols="5" class="p-0">
            <model-select v-model="language"
                          :options="languageList"
                          placeholder="Select Language"
            />
          </b-col>
        </b-form-group> 
    

        <b-form-group label="Time Zone : " 
                      :label-cols="3" :label-cols-xl="2"
                      label-align="right"
        >
          <b-col cols="8" class="p-0">
            <model-select v-model="timezone"
                          :options="timezoneList"
                          placeholder="Select Timezone"
            />
          </b-col>
        </b-form-group>
        <b-form-group label="Tags : " 
                      :label-cols="3" :label-cols-xl="2"
                      label-align="right"
                      class="mt-4"
        >
          <b-col cols="10" class="p-0">
            <BaseTag ref="baseTag" 
                     :tag-data="tags" 
                     :show-first-tag-row="creatable ? true : false"
                     editable
            />
          </b-col>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="updatable" class="btn-box mt-5">
        <b-button class="float-right ml-3 mb-1" size="md" type="submit" variant="outline-primary">
          {{ creatable ? 'Create' : 'Update' }}
        </b-button>
        <b-button class="float-right mb-1" size="md" type="reset" variant="outline-secondary">
          Reset
        </b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script>
import BaseTag from '@/components/base/tags/BATG_001_BaseTag.vue';
import BaseField from '@/components/base/form/BAFM_001_BaseField.vue';
import { ModelSelect } from 'vue-search-select';

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
    event: ['delete', 'create', 'update'],
    components: {
        BaseField,
        BaseTag,
        ModelSelect
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
        updatable: {
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
            userIdUnique: null
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
            if (this.userId === null) {
                return null;
            } 

            if (this.userId.length > 4) {
                return true;
            }

            return false;
        },
        validateUserIdUnique () {
            return this.userIdUnique;
        },
        validateUserId () {
            if (this.validateUserIdLength === null) {
                return null;
            }
            return  !!(this.validateUserIdLength && this.validateUserIdUnique);
        },
        validatePassword () {
            if (this.isEmpty(this.password)) { 
                return null;
            }
            if (this.password.length > 4) { 
                return true; 
            }
            return false;
        },
        validatePasswordCheck () {
            console.log('validation of password check');
            if (this.isEmpty(this.password) || this.isEmpty(this.passwordCheck)) {
                return null; 
            } else if (this.password !== this.passwordCheck) {
                return false; 
            } else {
                return true;
            }
        },
        validated () {
            return !!(this.validateUserId && 
                        this.validatePassword && 
                        this.validatePasswordCheck);
        }
    },
    watch: {
        userProp (updatedUser) {
            this.resetUserData(updatedUser);
        }
    },
    created() {
    },
    methods: {
        changedUserId () {
            this.userIdUnique = null;
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
        validate () {
            let result = true;

            if (!this.$refs.baseTag.validate()) {
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
        resetUnvalidFields () {
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
        async onCreate () {
            if (!this.validate()) {
                return;
            }

            let res = null;
            try {
                res = await this.$axios.post('/identity/user/create', this.getUserData());
                this.$emit('create', res.data);
                this.$alertify.success('User Successfully Created.');
            } catch (e) {
                console.error(e);
                this.$alertify.error('ERROR OCCURED during Creating User.');
            }
        },
        async onUpdate () {
            if (!this.validate()) {
                return;
            }

            let res = null;
            try {
                res = await this.$axios.post('/identity/user/update', this.getUserData());
                this.$emit('update', res.data);
                this.$alertify.success('User Successfully Updated.');
            } catch (e) {
                console.error(e);
                this.$alertify.error('ERROR OCCURED during Updating User.');
            }
        },
        onReset () {
            if (this.creatable) { 
                this.resetUserData(userModel); 
            } else { 
                this.resetUserData(this.userProp); 
            }
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
                tags: this.$refs.baseTag.tags
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
            this.language = user.language;
            this.timezone = user.timezone;
            this.$refs.baseTag.resetRows();
        },
        getUserValidMessage () {
            if (!this.validateUserIdLength) {
                return 'Your user ID must be 5-12 characters long.';
            } else if (this.validateUserIdUnique === null) {
                return 'Please check availability.';
            } else if (!this.validateUserIdUnique) {
                return 'This is duplicated. Please use another ID.';
            }
            return '';
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
        }
    }
}
.required {
    color: $violet;
}
</style>
