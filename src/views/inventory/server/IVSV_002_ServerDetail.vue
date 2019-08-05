<template>
  <b-form @reset.prevent="onReset" @submit.prevent="updatable && creatable ? onCreate() : onUpdate()">
    <b-form-group label="Server ID" :label-cols="3">
      <b-form-input v-model="serverId" :plaintext="!updatable" type="text" :state="validateServerId" />
      <b-form-invalid-feedback v-if="updatable" :state="validateServerId">
        Your server ID must be 5-12 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback v-if="updatable" :state="validateServerId">
        Looks Good.
      </b-form-valid-feedback>
    </b-form-group>

    <b-form-group v-if="updatable" label="Password" :label-cols="3">
      <b-form-input v-model="password" :plaintext="!updatable" type="password" :state="validatePassword" />
      <b-form-invalid-feedback :state="validatePassword">
        Your Password must be 5-12 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validatePassword" />
    </b-form-group>

    <b-form-group v-if="updatable" label="Password Check" :label-cols="3">
      <b-form-input v-model="passwordCheck" :plaintext="!updatable" type="password"
                    :state="validatePasswordCheck"
      />
      <b-form-invalid-feedback :state="validatePasswordCheck">
        Please check your Password again.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validatePasswordCheck" />
    </b-form-group>

    <b-form-group label="Name" :label-cols="3">
      <b-form-input v-model="name" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="E-Mail" :label-cols="3">
      <b-form-input v-model="email" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Phone" :label-cols="3">
      <b-form-input v-model="mobile" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Group Name" :label-cols="3">
      <b-form-input v-model="group" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Domain ID" label-for="domainId" :label-cols="3">
      <b-form-input v-model="domainId" :plaintext="!updatable" type="text" :state="validateDomainId" />
      <b-form-invalid-feedback v-if="updatable" :state="validateDomainId">
        Please enter your domain ID.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group label="Language" label-for="language" :label-cols="3">
      <b-form-input v-model="language" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Time Zone" label-for="timezone" :label-cols="3">
      <b-form-input v-model="timezone" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Tags" :label-cols="3">
      <b-col :cols="updatable || creatable ? '12' : '5'">
        <BaseTag ref="baseTag" :tag-data="tags" :editable="updatable || creatable" />
      </b-col>
    </b-form-group>

    <div v-if="updatable" class="btn-box mt-5">
      <b-button class="float-right ml-3 mb-1" size="md" type="submit" variant="primary">
        {{ creatable ? 'Create' : 'Update' }}
      </b-button>
      <b-button class="float-right mb-1" size="md" type="reset" variant="secondary">
        Reset
      </b-button>
      <b-button v-if="!creatable" class="float-left" size="md" type="reset" variant="danger" @click="onDelete">
        Delete
      </b-button>
    </div>
  </b-form>
</template>

<script>
import BaseTag from '@/components/base/tags/BATG_001_BaseTag.vue';

const serverModel = {
    serverId: null,
    name: null,
    password: null,
    email: null,
    mobile: null,
    group: null,
    domainId: null,
    language: null,
    timezone: null,
    tags: []
};

export default {
    name: 'ServerDetail',
    components: {
        BaseTag
    },
    props: {
        serverProp: {
            type: Object,
            default: () => (serverModel),
            required: true
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
            serverId: this.serverProp.serverId, // required
            password: this.serverProp.password, // required
            passwordCheck: null, // required
            name: this.serverProp.name,
            email: this.serverProp.email,
            mobile: this.serverProp.mobile,
            group: this.serverProp.group,
            domainId: this.serverProp.domainId, // required
            language: this.serverProp.language,
            timezone: this.serverProp.timezone
        };
    },
    computed: {
        tags () {
            return this.serverProp.tags; 
        },
        validateServerId () {

            if (this.serverId === null) {
                return null;
            }

            if (this.serverId.length > 4) {
                return true;
            }

            return false;
        },
        validatePassword () {
            if (this.password === null) {
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
        validateDomainId () {
            if (this.domainId === null) {
                return null;
            }
            if (this.domainId.length > 0) {
                return true;
            }
            return false;
        },
        validated () {
            return !!(this.validateServerId && this.validatePassword && this.validatePasswordCheck && this.validateDomainId);
        }
    },
    watch: {
        serverProp (updatedServer) {
            this.resetServerData(updatedServer);
        }
    },
    methods: {
        onCreate () {
            if (!this.validated) {
                this.serverId = this.serverId === null ? '' : this.serverId;
                this.password = this.password === null ? '' : this.password;
                this.passwordCheck = this.passwordCheck === null ? '' : this.passwordCheck;
                this.domainId = this.domainId === null ? '' : this.domainId;
                return;
            }
            console.log('creating....');
            setTimeout(() => {
                this.$store.dispatch('modal/closeModal');
            }, 1000);
        },
        onUpdate (e) {
            if (!this.validated) {
                this.serverId = this.serverProp.serverId;
                this.password = this.serverProp.password;
                this.passwordCheck = '';
                this.domainId = this.serverProp.domainId;
                return;
            }
            console.log('updating....');
            setTimeout(() => {
                this.$store.dispatch('modal/closeModal');
            }, 1000);
        },
        onDelete () {
            console.log('deleting....');
            setTimeout(() => {
                this.$store.dispatch('modal/closeModal');
            }, 1000);
        },
        onReset () {
            if (this.creatable) {
                this.resetServerData(serverModel);
            } else {
                this.resetServerData(this.serverProp);
            }
        },
        resetServerData (server) {
            this.serverId = server.serverId;
            this.password = server.password;
            this.passwordCheck = null;
            this.name = server.name;
            this.email = server.email;
            this.mobile = server.mobile;
            this.group = server.group;
            this.domainId = server.domainId;
            this.language = server.language;
            this.timezone = server.timezone;
            this.$refs.baseTag.resetRows();
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
