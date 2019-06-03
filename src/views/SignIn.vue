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
              <b-form-input type="text" placeholder="Username" />
            </b-input-group>
          </b-form-group>
          <b-form-group>
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text><i class="fa fa-asterisk" /></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input type="password" placeholder="Password" autocomplete="current-password" />
            </b-input-group>
          </b-form-group>
          <div class="form-group form-actions">
            <b-button type="submit" size="sm" variant="success">
              Submit
            </b-button>
          </div>
        </b-form>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  created () {
    this.$store.dispatch('auth/login', {
      username: 'abc',
      password: 'abc'
    })
  }

}
</script>

<style lang="scss" scoped>
.content-body {
  height: 100vh;
}
</style>
