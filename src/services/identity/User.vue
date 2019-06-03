<template>
  <div>
    User
  </div>
</template>

<script>
export default {
  name: 'User',
  mounted () {
    this.createUsers()
  },
  methods: {
    createUsers () {
      console.log('create user start')
      this.$http.get('/users')
        .then(res => {
          console.log(res.data)
        }, err => console.error(err))
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
