<template>
    <div>
        <p-menu-list :list-items="menuList"
                     :tooltip="userId"
                     @select="doAction"
        >
            <template #activator="{ active }">
                <p-button class="lang-btn" :class="{active: active}">
                    <template>
                        <f-i icon="fa-archive" />
                    </template>
                </p-button>
            </template>
        </p-menu-list>

        <profile-modal ref="profileModal" />
    </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';
import PButton from '@/components/atoms/buttons/Button';
import FI from '@/components/atoms/icons/FI';
import PMenuList from '@/components/organisms/lists/menu-list/MenuList';
import ProfileModal from '@/views/common/profile/ProfileModal';

export default {
    name: 'AccountMenu',
    components: {
        PButton,
        FI,
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
        };
    },
    computed: {
        ...mapGetters('user', [
            'userId',
        ]),
        ...mapGetters('auth', [
            'client_id',
        ]),
    },
    methods: {
        ...mapMutations('user', [
            'setUserId',
        ]),
        ...mapActions('auth', [
            'logout',
        ]),
        doAction(item) {
            if (item.key === 'signout') this.signOut();
            else if (item.key === 'profile') this.openProfile();
        },
        async signOut() {
            if (this.client_id) {
                await this.logout(this.client_id);
                this.$router.push({ path: '/google-sign-in' });
                this.oAuthSignOut();
            } else {
                await this.logout();
                this.$router.push({ path: '/sign-in' });
            }
        },
        openProfile() {
            this.$refs.profileModal.showModal();
        },
        oAuthSignOut() {
            // eslint-disable-next-line no-undef
            const auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut();
        },
    },
};
</script>

<style lang="scss" scoped>
    .lang-btn {
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        width: 32px;
        height: 32px;
        color: $primary4;
        &:hover, &.active {
            background-color: $primary-dark;
        }
    }
</style>
