<template>
  <span>
    <b-dropdown size="sm" right no-caret>
      <template slot="button-content">
        <span class="name">{{ userId }}</span>&nbsp;&nbsp;
        <i class="icon fal fa-angle-down" />
      </template>
      <b-dropdown-item @click="onClickProfile">
        <div class="item">
          <i class="fal fa-address-card" />
          <span class="name">{{ tr('PROFILE') }}</span>
        </div>
      </b-dropdown-item>
      <b-dropdown-item @click="logout">
        <div class="item">
          <i class="fal fa-sign-out" />
          <span class="name">{{ tr('LOG_OUT') }}</span>
        </div>
      </b-dropdown-item>
    </b-dropdown>

    <ProfileModal ref="profileModal" />
  </span>
</template>

<script>
import ProfileModal from '@/views/common/VICO_004_ProfileModal';
export default {
    name: 'AccountDropdown',
    components: {
        ProfileModal
    },data () {
        return {
            userId: null
        };
    },
    created(){
        this.userId = sessionStorage.getItem('userId');
    },
    methods: {
        async logout () {
            await this.$store.dispatch('auth/logout');
            this.$router.push({ path: '/log-in' });
        },
        onClickProfile () {
            this.$refs.profileModal.showModal();
        }
    }
};
</script>

<style lang="scss" scoped>
.icon-user {
  margin-right: 8px;
}
</style>
