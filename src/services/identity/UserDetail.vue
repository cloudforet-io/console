<template>
  <b-card>
    <div slot="header">
      <strong>User Detail</strong>
    </div>
    <b-form>
      <b-form-group label="User ID" label-for="userId" :label-cols="3" :horizontal="true">
        <b-form-input id="userId" plaintext type="text" :value="user.userId" />
      </b-form-group>

      <b-form-group label="Name" label-for="name" :label-cols="3" :horizontal="true">
        <b-form-input id="name" plaintext type="text" :value="user.name" />
      </b-form-group>

      <b-form-group label="E-Mail" label-for="email" :label-cols="3" :horizontal="true">
        <b-form-input id="email" plaintext type="text" :value="user.email" />
      </b-form-group>

      <b-form-group label="Phone" label-for="mobile" :label-cols="3" :horizontal="true">
        <b-form-input id="mobile" plaintext type="number" :value="user.mobile" />
      </b-form-group>

      <b-form-group label="Group Name" label-for="group" :label-cols="3" :horizontal="true">
        <b-form-input id="group" plaintext type="text" :value="user.group" />
      </b-form-group>

      <b-form-group label="Domain ID" label-for="domainId" :label-cols="3" :horizontal="true">
        <b-form-input id="domainId" plaintext type="text" :value="user.domainId" />
      </b-form-group>

      <b-form-group label="Language" label-for="language" :label-cols="3" :horizontal="true">
        <b-form-input id="language" plaintext type="text" :value="user.language" />
      </b-form-group>

      <b-form-group label="Time Zone" label-for="timezone" :label-cols="3" :horizontal="true">
        <b-form-input id="timezone" plaintext type="text" :value="user.timezone" />
      </b-form-group>

      <b-form-group label="Tags" label-for="tags" :label-cols="3" :horizontal="true">
        <BaseTags :tags="user.tags" />
      </b-form-group>

      <!-- <div slot="footer">
        <b-button type="submit" size="sm" variant="primary">
          <i class="fa fa-dot-circle-o" /> Submit
        </b-button>
        <b-button type="reset" size="sm" variant="danger">
          <i class="fa fa-ban" /> Reset
        </b-button>
      </div> -->
    </b-form>
  </b-card>
</template>

<script>
import BaseTags from '@/components/base/BaseTags'
export default {
  name: 'UserDetail',
  components: {
    BaseTags
  },
  props: {
    user: {
      type: Object,
      default: null
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
