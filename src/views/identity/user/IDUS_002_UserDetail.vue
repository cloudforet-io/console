<template>
  <b-form @reset.prevent="onReset" 
          @submit.prevent="updatable && creatable ? onCreate() : onUpdate()"
  >
    <b-form-group label="User ID" 
                  :label-cols="3"
                  :description="validateUserId === null ? 'Your user ID must be 5-12 characters long.' : null"
    >
      <b-input-group>
        <b-form-input v-model="userId" 
                      type="text" 
                      autocomplete="off"
                      :plaintext="!creatable" 
                      :state="validateUserId"
                      @input="changedUserId"
        />
        <b-input-group-append v-if="creatable">
          <b-button variant="light"
                    :disabled="!validateUserIdLength"
                    @click="checkIdAvailability"
          >
            Check availability
          </b-button>
        </b-input-group-append>
      </b-input-group>
      <b-form-invalid-feedback v-if="creatable" :state="validateUserId">
        <span v-if="!validateUserIdLength">Your user ID must be 5-12 characters long.</span>
        <span v-else-if="validateUserIdUnique === null">Please check availability.</span>
        <span v-else-if="!validateUserIdUnique">This is duplicated. Please use another ID.</span>
      </b-form-invalid-feedback>
      <b-form-valid-feedback v-if="creatable" :state="validateUserId">
        This is Available.
      </b-form-valid-feedback>
    </b-form-group>

    <b-form-group v-if="updatable" label="Password" :label-cols="3">
      <b-form-input v-model="password" autocomplete="new-password" type="password" :state="validatePassword" />
      <b-form-invalid-feedback :state="validatePassword">
        Your Password must be 5-12 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validatePassword" />
    </b-form-group>

    <b-form-group v-if="updatable" label="Password Check" :label-cols="3">
      <b-form-input v-model="passwordCheck" type="password"
                    :state="validatePasswordCheck"
      />
      <b-form-invalid-feedback :state="validatePasswordCheck">
        Please check your Password again.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validatePasswordCheck" />
    </b-form-group>

    <b-form-group label="Name" :label-cols="3">
      <b-form-input v-model="name" type="text" />
    </b-form-group>

    <b-form-group label="E-Mail" :label-cols="3">
      <b-form-input v-model="email" type="text" />
    </b-form-group>

    <b-form-group label="Phone" :label-cols="3">
      <b-form-input v-model="mobile" type="text" />
    </b-form-group>

    <b-form-group label="Group Name" :label-cols="3">
      <b-form-input v-model="group" type="text" />
    </b-form-group>

    <b-form-group label="Domain ID" :label-cols="3">
      <b-form-input v-model="domainId" plaintext type="text" />
    </b-form-group>

    <b-form-group label="Language" :label-cols="3">
      <b-col cols="5" class="p-0">
        <b-form-select v-model="language">
          <option :value="null" selected disabled hidden>
            Choose Language
          </option>
          <option v-for="lang in languageList" :key="lang">
            {{ lang }}
          </option>
        </b-form-select>
      </b-col>
    </b-form-group>

    <b-form-group label="Time Zone" label-for="timezone" :label-cols="3">
      <b-col cols="8" class="p-0">
        <b-form-select v-model="timezone">
          <option :value="null" selected disabled hidden>
            Choose Timezone
          </option>
          <option v-for="country in timezoneList" :key="country">
            {{ country }}
          </option>
        </b-form-select>
      </b-col>
    </b-form-group>

    <b-form-group label="Tags" :label-cols="3" class="mt-4">
      <b-col :cols="updatable || creatable ? '12' : '5'" class="p-0">
        <BaseTag ref="baseTag" :tag-data="tags" :editable="updatable || creatable" />
      </b-col>
    </b-form-group>

    <div v-if="updatable" class="btn-box mt-5">
      <b-button class="float-right ml-3 mb-1" size="md" type="submit" variant="outline-primary">
        {{ creatable ? 'Create' : 'Update' }}
      </b-button>
      <b-button class="float-right mb-1" size="md" type="reset" variant="outline-secondary">
        Reset
      </b-button>
      <b-button v-if="!creatable" class="float-left" size="md" type="reset" variant="outline-danger" @click="onDelete">
        Delete
      </b-button>
    </div>

    <BaseSimpleModal
      ref="DeleteCheck"
      title="User Delete"
      text="Are you sure you want to delete?"
      type="danger"
      :ok-only="false"
      @ok="deleteUser"
    />
  </b-form>
</template>

<script>
import BaseTag from '@/components/base/tags/BATG_001_BaseTag.vue';
import BaseSimpleModal from '@/components/base/modal/BAMO_002_BaseSimpleModal.vue';

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
            domainId: sessionStorage.getItem('domainId'),
            language: this.userProp.language,
            timezone: this.userProp.timezone,
            languageList: this.$i18n.availableLocales,
            timezoneList: this.getAllTimezones(),
            userIdUnique: null
        };
    },
    computed: {
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
            if (this.passwordCheck === null) {
                return null; 
            }
            if (!this.password) {
                return false; 
            }
            if (this.password === this.passwordCheck) { 
                return true;
            }
            return false;
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
        async onDelete () {
            this.$refs.DeleteCheck.showModal();
        },
        async deleteUser () {
            try {
                await this.$axios.post('/identity/user/delete', {
                    user_id: this.userId
                });
                this.$emit('delete');
                this.$alertify.success('Selected User Successfully Deleted.');
            } catch (e) {
                console.error(e);
                this.$alertify.error('ERROR OCCURED during Deleting User.');
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
</style>
