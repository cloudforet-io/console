<template>
    <div>
        <p-menu-list :list-items="menuList"
                     :tooltip="userId"
                     :tooltip-options="{offset: '20px'}"
                     @select="doAction"
        >
            <template #contents>
                <p-i name="ic_gnb_profile" width="2rem" height="2rem"
                     :color="`transparent ${iconColor}`"
                />
            </template>
        </p-menu-list>

        <profile-modal v-if="profileVisible"
                       :visible.sync="profileVisible"
                       :user-id="userId"
                       :user-type="userType"
                       :auth-type="authType"
        />
    </div>
</template>

<script>
import { reactive, toRefs, computed } from '@vue/composition-api';
import PMenuList from '@/components/organisms/lists/menu-list/MenuList.vue';
import ProfileModal from '@/views/common/profile/ProfileModal.vue';
import PI from '@/components/atoms/icons/PI.vue';
import styles from '@/styles/_variables.scss';

export default {
    name: 'AccountMenu',
    components: {
        PI,
        PMenuList,
        ProfileModal,
    },
    setup(props, { root }) {
        const state = reactive({
            profileVisible: false,
            menuList: [
                { key: 'profile', contents: 'Profile' },
                { key: 'signout', contents: 'Sign Out' },
            ],
            iconColor: styles.primary4,
            userId: computed(() => root.$store.getters['auth/userId']),
            // clientId: computed(() => root.$store.getters['domain/clientId']),
            authType: computed(() => root.$store.getters['domain/authType']),
            userType: computed(() => root.$store.getters['auth/userType']),
        });
        const openProfile = () => {
            state.profileVisible = true;
        };
        const oAuthSignOut = () => {
            gapi.auth2.getAuthInstance().signOut();
        };
        const signOut = () => {
            root.$store.dispatch('auth/signOut');
        };
        const signOutAction = async () => {
            await signOut();
            if (state.authType === 'local') {
                root.$router.push({ path: '/sign-in' });
            } else {
                oAuthSignOut();
                root.$router.push({ path: '/google-sign-in' });
            }
        };
        const doAction = (item) => {
            if (item.key === 'signout') signOutAction();
            else if (item.key === 'profile') openProfile();
        };

        return {
            ...toRefs(state),
            signOut,
            oAuthSignOut,
            doAction,
        };
    },
};
</script>

<style lang="scss" scoped>
</style>
