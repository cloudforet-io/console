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
import {
    reactive, toRefs, computed, defineComponent,
} from '@vue/composition-api';
import PMenuList from '@/components/organisms/lists/menu-list/PMenuList.vue';
import ProfileModal from '@/views/common/profile/ProfileModal.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { useStore } from '@/store/toolset';

export default defineComponent({
    name: 'AccountMenu',
    components: {
        PI,
        PMenuList,
        ProfileModal,
    },
    setup(props, { root }) {
        const { logout } = useStore();
        const state = reactive({
            profileVisible: false,
            menuList: [
                { key: 'profile', contents: 'Profile' },
                { key: 'signout', contents: 'Sign Out' },
            ],
            iconColor: computed(() => '#F8F8FC'),
            userId: computed(() => root.$ls.user.state.userId),
        });
        const openProfile = () => {
            state.profileVisible = true;
        };
        const signOutAction = async () => {
            logout(root);
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
});
</script>

<style lang="postcss" scoped>
</style>
