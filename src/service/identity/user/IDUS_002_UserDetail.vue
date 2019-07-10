<template>
  <b-form @reset.prevent="onReset" @submit.prevent="updatable && creatable ? onCreate() : onUpdate()">
    <b-form-group label="User ID" :label-cols="3" :horizontal="true">
      <b-form-input v-model="userId" :plaintext="!updatable" type="text" :state="validateUserId" />
      <b-form-invalid-feedback v-if="updatable" :state="validateUserId">
        Your user ID must be 5-12 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback v-if="updatable" :state="validateUserId">
        Looks Good.
      </b-form-valid-feedback>
    </b-form-group>

    <b-form-group v-if="updatable" label="Password" :label-cols="3" :horizontal="true">
      <b-form-input v-model="password" :plaintext="!updatable" type="password" :state="validatePassword" />
      <b-form-invalid-feedback :state="validatePassword">
        Your Password must be 5-12 characters long.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validatePassword" />
    </b-form-group>

    <b-form-group v-if="updatable" label="Password Check" :label-cols="3" :horizontal="true">
      <b-form-input v-model="passwordCheck" :plaintext="!updatable" type="password"
                    :state="validatePasswordCheck"
      />
      <b-form-invalid-feedback :state="validatePasswordCheck">
        Please check your Password again.
      </b-form-invalid-feedback>
      <b-form-valid-feedback :state="validatePasswordCheck" />
    </b-form-group>

    <b-form-group label="Name" :label-cols="3" :horizontal="true">
      <b-form-input v-model="name" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="E-Mail" :label-cols="3" :horizontal="true">
      <b-form-input v-model="email" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Phone" :label-cols="3" :horizontal="true">
      <b-form-input v-model="mobile" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Group Name" :label-cols="3" :horizontal="true">
      <b-form-input v-model="group" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Domain ID" label-for="domainId" :label-cols="3" :horizontal="true">
      <b-form-input v-model="domainId" :plaintext="!updatable" type="text" :state="validateDomainId" />
      <b-form-invalid-feedback v-if="updatable" :state="validateDomainId">
        Please enter your domain ID.
      </b-form-invalid-feedback>
    </b-form-group>

    <b-form-group label="Language" label-for="language" :label-cols="3" :horizontal="true">
      <b-form-input v-model="language" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Time Zone" label-for="timezone" :label-cols="3" :horizontal="true">
      <b-form-input v-model="timezone" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Tags" :label-cols="3" :horizontal="true">
      <BaseTag :updatable="updatable" :creatable="creatable" :tags-prop="updatable ? updatableTags : tags" />
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
import BaseTag from '@/component/base/tag/BATG_001_BaseTag.vue';

const userModel = {
  userId: null,
  name: null,
  password: null,
  email: null,
  mobile: null,
  group: null,
  domainId: null,
  language: null,
  timezone: null,
  tags: []
}

export default {
  name: 'UserDetail',
  components: {
    BaseTag
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
      userId: this.userProp.userId, // required
      password: this.userProp.password, // required
      passwordCheck: null, // required
      name: this.userProp.name,
      email: this.userProp.email,
      mobile: this.userProp.mobile,
      group: this.userProp.group,
      domainId: this.userProp.domainId, // required
      language: this.userProp.language,
      timezone: this.userProp.timezone,
      updatableTags: this.updatable ? this.userProp.tags.slice(0) : []
    }
  },
  computed: {
    tags () {
      return this.updatable ? this.updatableTags : this.userProp.tags
    },
    validateUserId () {
      if (this.userId === null) return null
      if (this.userId.length > 4) return true
      return false
    },
    validatePassword () {
      if (this.password === null) return null
      if (this.password.length > 4) return true
      return false
    },
    validatePasswordCheck () {
      if (this.passwordCheck === null) return null
      if (!this.password) return false
      if (this.password === this.passwordCheck) return true
      return false
    },
    validateDomainId () {
      if (this.domainId === null) return null
      if (this.domainId.length > 0) return true
      return false
    },
    validated () {
      return !!(this.validateUserId && this.validatePassword && this.validatePasswordCheck && this.validateDomainId)
    }
  },
  watch: {
    userProp (updatedUser) {
      this.resetUserData(updatedUser)
    }
  },
  methods: {
    onCreate () {
      if (!this.validated) {
        this.userId = this.userId === null ? '' : this.userId
        this.password = this.password === null ? '' : this.password
        this.passwordCheck = this.passwordCheck === null ? '' : this.passwordCheck
        this.domainId = this.domainId === null ? '' : this.domainId
        return
      }
      console.log('creating....')
      setTimeout(() => {
        this.$store.dispatch('modal/closeModal')
      }, 1000)
    },
    onUpdate (e) {
      if (!this.validated) {
        this.userId = this.userProp.userId
        this.password = this.userProp.password
        this.passwordCheck = ''
        this.domainId = this.userProp.domainId
        return
      }
      console.log('updating....')
      setTimeout(() => {
        this.$store.dispatch('modal/closeModal')
      }, 1000)
    },
    onDelete () {
      console.log('deleting....')
      setTimeout(() => {
        this.$store.dispatch('modal/closeModal')
      }, 1000)
    },
    onReset () {
      if (this.creatable) this.resetUserData(userModel)
      else this.resetUserData(this.userProp)
    },
    resetUserData (user) {
      this.userId = user.userId
      this.password = user.password
      this.passwordCheck = null
      this.name = user.name
      this.email = user.email
      this.mobile = user.mobile
      this.group = user.group
      this.domainId = user.domainId
      this.language = user.language
      this.timezone = user.timezone
      this.updatableTags = user.tags.slice(0)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
