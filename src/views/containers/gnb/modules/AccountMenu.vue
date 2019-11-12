<template>
    <div>
        <p-menu-list :list-items="menuList"
                     :tooltip="userId"
                     :tooltip-options="{offset: '20px'}"
                     @select="doAction"
        >
            <template #contents>
                <p-i name="ic_gnb_profile" width="32px" height="32px"
                     :color="`transparent ${iconColor}`"
                />
            </template>
        </p-menu-list>

        <profile-modal ref="profileModal" />
    </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';
import PMenuList from '@/components/organisms/lists/menu-list/MenuList';
import ProfileModal from '@/views/common/profile/ProfileModal';
import PI from '@/components/atoms/icons/PI';
import styles from '@/styles/_variables.scss';

export default {
    name: 'AccountMenu',
    components: {
        PI,
        PMenuList,
        ProfileModal,
    },
    data() {
        return {
            visible: false,
            menuList: [
                { key: 'profile', contents: 'Profile' },
                { key: 'signout', contents: 'Sign Out' },
            ],
            iconColor: styles.primary4,
        };
    },
    computed: {
        ...mapGetters('user', [
            'userId',
        ]),
        ...mapGetters('auth', [
            'client_id',
        ]),
        ...mapGetters('domain', [
            'authType',
        ]),
    },
    methods: {
        ...mapMutations('user', [
            'setUserId',
        ]),
        ...mapActions('auth', [
            'signOut',
        ]),
        doAction(item) {
            if (item.key === 'signout') this.signOutAction();
            else if (item.key === 'profile') this.openProfile();
        },
        async signOutAction() {
            if (this.authType === 'local') {
                await this.signOut();
                this.$router.push({ path: '/sign-in' });
            } else {
                await this.signOut();
                this.$router.push({ path: '/google-sign-in' });
                this.oAuthSignOut();
            }
        },
        openProfile() {
            this.$refs.profileModal.showModal();
        },
        oAuthSignOut() {
            const auth = gapi.auth.getAuthInstance();
            auth.signOut();
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
