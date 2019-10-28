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
                    <span class="name">{{ tr('COMMON.PROFILE') }}</span>
                </div>
            </b-dropdown-item>
            <b-dropdown-item @click="logout">
                <div class="item">
                    <i class="fal fa-sign-out" />
                    <span class="name">{{ tr('COMMON.LOG_OUT') }}</span>
                </div>
            </b-dropdown-item>
        </b-dropdown>

        <ProfileModal ref="profileModal" />
    </span>
</template>

<script>
import ProfileModal from '@/views/common/profile/ProfileModal';

export default {
    name: 'AccountDropdown',
    components: {
        ProfileModal,
    },
    data() {
        return {
            userId: null,
        };
    },
    created() {
        this.userId = localStorage.getItem('userId');
    },
    methods: {
        async logout() {
            const clientId = this.$store.getters['auth/client_id'];
            if (this.isEmpty(clientId)) {
                await this.$store.dispatch('auth/logout');
                this.$router.push({ path: '/sign-in' });
            } else {
                await this.$store.dispatch('auth/logout', clientId);
                this.$router.push({ path: '/google-sign-in' });
                this.oAuthSignOut();
            }
        },
        onClickProfile() {
            this.$refs.profileModal.showModal();
        },
        oAuthSignOut() {
            const auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(() => {
                console.log('on sign out');
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.icon-user {
  margin-right: 8px;
}
</style>
