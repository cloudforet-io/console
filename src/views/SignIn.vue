<template>
  <b-row no-gutters align-v="center" align-h="center" class="animated fadeIn content-body">
    <b-col cols="4">
      <h3>Welcome to the OOOOOO.</h3>
    </b-col>
    <b-col cols="4">
      <b-card class="signin-box">
        <b-form>
          <b-form-group>
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text><i class="fa fa-user" /></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-model="username" type="text" placeholder="Username" />
            </b-input-group>
          </b-form-group>
          <b-form-group>
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text><i class="fa fa-asterisk" /></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />
            </b-input-group>
          </b-form-group>
          <div class="form-group form-actions">
            <b-button type="button" size="sm" variant="success" @click="login">
              Login
            </b-button>
          </div>
        </b-form>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>

export default {
  data () {
    return {
      username: 'iamnewyorker1222',
      password: 'this_is_my_scret_password1',
      fromURL: '/dashboard'
    }
  },
  computed: {
  },
  methods: {
    async login () {
      await this.$store.dispatch('auth/login',
        {
          username: this.username,
          password: this.password
        }
      )
      this.$router.push(this.fromURL)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (from.fullPath !== '/' && from.fullPath !== '/sign-in') vm.fromURL = from.fullPath
    })
  }
}
</script>

<style lang="scss" scoped>
.content-body {
  height: 100vh;
}
</style>
