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
            iconColor: computed(() => '#F8F8FC'),
            userId: computed(() => root.$ls.user.state.userId),
            // clientId: computed(() => root.$store.getters['domain/clientId']),
        });
        const openProfile = () => {
            state.profileVisible = true;
        };
        const signOutAction = async () => {
            root.$ls.logout();
            root.$router.push({ name: 'Login' });
        };
        const doAction = (item) => {
            if (item.key === 'signout') signOutAction();
            else if (item.key === 'profile') openProfile();
        };

        return {
            ...toRefs(state),
            doAction,
        };
    },
};
</script>

<style lang="scss" scoped>
</style>
