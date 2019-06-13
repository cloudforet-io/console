<template>
  <b-form>
    <b-form-group label="User ID" label-for="userId" :label-cols="3" :horizontal="true">
      <b-form-input id="userId" v-model="user.userId" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Name" label-for="name" :label-cols="3" :horizontal="true">
      <b-form-input id="name" v-model="user.name" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="E-Mail" label-for="email" :label-cols="3" :horizontal="true">
      <b-form-input id="email" v-model="user.email" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Phone" label-for="mobile" :label-cols="3" :horizontal="true">
      <b-form-input id="mobile" v-model="user.mobile" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Group Name" label-for="group" :label-cols="3" :horizontal="true">
      <b-form-input id="group" v-model="user.group" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Domain ID" label-for="domainId" :label-cols="3" :horizontal="true">
      <b-form-input id="domainId" v-model="user.domainId" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Language" label-for="language" :label-cols="3" :horizontal="true">
      <b-form-input id="language" v-model="user.language" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Time Zone" label-for="timezone" :label-cols="3" :horizontal="true">
      <b-form-input id="timezone" v-model="user.timezone" :plaintext="!updatable" type="text" />
    </b-form-group>

    <b-form-group label="Tags" label-for="tags" :label-cols="3" :horizontal="true">
      <BaseTags :updatable="updatable" :tags-prop="user.tags" />
    </b-form-group>

    <div v-if="updatable" class="btn-box mt-5">
      <b-button class="float-right ml-3 mb-1" size="md" type="button" variant="primary"
                @click="creatable ? createUser() : updateUser()"
      >
        {{ creatable ? 'Create' : 'Update' }}
      </b-button>
      <b-button class="float-right mb-1" size="md" type="reset" variant="secondary">
        Reset
      </b-button>
      <b-button v-if="!creatable" class="float-left" size="md" type="reset" variant="danger" @click="deleteUser">
        Delete
      </b-button>
    </div>
  </b-form>
</template>

<script>
import BaseTags from '@/components/base/BaseTags'
export default {
  name: 'UserDetail',
  components: {
    BaseTags
  },
  props: {
    userProp: {
      type: Object,
      default: () => ({
        userId: '',
        name: '',
        email: '',
        mobile: '',
        group: '',
        domainId: '',
        language: '',
        timezone: '',
        tags: []
      })
    },
    creatable: {
      type: Boolean,
      default: false
    },
    updatable: {
      type: Boolean,
      default: false
    },
    completeFn: {
      type: Function,
      default: () => () => {}
    }
  },
  data () {
    return {
    }
  },
  computed: {
    user () {
      let obj = this.updatable ? Object.assign({}, this.userProp) : this.userProp
      return obj
    }
  },
  methods: {
    createUser () {
      console.log('creating....')
      setTimeout(() => {
        this.$store.dispatch('modal/closeModal')
      }, 1000)
    },
    updateUser () {
      console.log('updating....')
      setTimeout(() => {
        this.$store.dispatch('modal/closeModal')
      }, 1000)
    },
    deleteUser () {
      console.log('deleting....')
      setTimeout(() => {
        this.$store.dispatch('modal/closeModal')
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
