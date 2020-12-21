<template>
    <vertical-page-layout :min-width="0" :init-width="260" :max-width="400">
        <template #sidebar>
            <div class="member-profile">
                <p-i :name="userState.isAdmin ? 'admin' : 'user'" width="3rem" height="3rem"
                     class="member-icon"
                />
                <p class="member-id">
                    {{ userState.userId }}
                </p>
                <p v-if="userState.isAdmin" class="member-type">
                    SpaceONE Admin
                </p>
                <p v-else class="member-type">
                    SpaceONE User
                </p>
            </div>
            <div class="menu-title">
                My Account
            </div>
            <p-hr class="menu-divider" />
            <div v-for="(item) in sidebarState.userMenuList" :key="item.label"
                 class="menu-item"
                 :class="{'selected': item.label === sidebarState.selectedItem.label}"
                 @click="showAccountPage(item)"
            >
                {{ item.label }}
            </div>
            <div v-if="userState.isAdmin" class="admin-menu-wrapper">
                <div class="menu-title">
                    Administrator
                </div>
                <p-hr class="menu-divider" />
                <div v-for="(item) in sidebarState.adminMenuList"
                     :key="item.label"
                     class="menu-item"
                     :class="{'selected': item.label === sidebarState.selectedItem.label}"
                     @click="showManagementPage(item)"
                >
                    User Management
                </div>
            </div>
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import VerticalPageLayout from '@/views/common/components/page-layout/VerticalPageLayout.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import { store } from '@/store';
import PI from '@/components/atoms/icons/PI.vue';
import router from '@/routes';

interface SidebarItemType {
    label: string;
}

export default {
    name: 'User',
    components: {
        VerticalPageLayout,
        PI,
        PHr,
    },
    beforeRouteEnter(to, from, next) {
        const isAdmin = computed(() => store.getters['user/isAdmin']).value;
        console.log(isAdmin);
        if (isAdmin) {
            next((vm) => {
                vm.$router.replace({ name: 'userManagement', query: { ...router.currentRoute.query } }).catch(() => {});
            });
        } else {
            next((vm) => {
                vm.$router.replace({ name: 'userAccount', query: { ...router.currentRoute.query } }).catch(() => {});
            });
        }
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const userState = reactive({
            isAdmin: computed(() => store.getters['user/isAdmin']),
            userType: computed(() => store.state.user.backend) as unknown as string,
            userName: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            userId: computed(() => store.state.user.userId),
        });
        const sidebarState = reactive({
            showManagementPage: true,
            userMenuList: [
                {
                    label: 'Account & Profile',
                },
            ],
            adminMenuList: [
                {
                    label: 'User Management',
                },
            ],
            selectedItem: {} as SidebarItemType,
        });
        const showAccountPage = (item) => {
            sidebarState.selectedItem = item;
            vm.$router.replace({ name: 'userAccount', query: { ...router.currentRoute.query } }).catch(() => {});
        };
        const showManagementPage = (item) => {
            sidebarState.selectedItem = item;
            vm.$router.replace({ name: 'userManagement', query: { ...router.currentRoute.query } }).catch(() => {});
        };

        (async () => {
            if (!userState.isAdmin) {
                sidebarState.selectedItem = sidebarState.userMenuList[0];
            }
            if (userState.isAdmin) {
                sidebarState.selectedItem = sidebarState.adminMenuList[0];
            }
        })();
        return {
            userState,
            sidebarState,
            showAccountPage,
            showManagementPage,
        };
    },

};
</script>

<style lang="postcss" scoped>

.member-profile {
    text-align: center;
    vertical-align: middle;
    padding: 1rem 2.125rem;
    margin-top: 1.5rem;
    margin-bottom: 2.125rem;
    width: 14.75rem;
    height: 7.875rem;
    .member-icon {
        @apply mx-auto;
        width: 3rem;
        height: 3rem;
        border-radius: 100%;
        margin-bottom: 0.5rem;
        overflow: hidden;
    }
    .member-id {
        @apply text-gray-900;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
        line-height: 140%;
    }
    .member-type {
        @apply text-gray-500;
        font-size: 0.75rem;
        line-height: 120%;
    }
}
.menu-title {
    @apply font-bold text-gray-900;
    font-size: 0.875rem;
    line-height: 140%;
    margin-left: 1rem;
    margin-bottom: 0.5625rem;
}
.menu-divider {
    @apply w-full;
    margin-bottom: 0.75rem;
}
.menu-item {
    @apply text-gray-900 truncate;
    width: 14.75rem;
    height: 2rem;
    font-size: 0.875rem;
    line-height: 140%;
    padding: 6px 1rem;
    margin-left: 0.75rem;
    margin-right: 0.75rem;
    &:hover {
        @apply bg-blue-100 cursor-pointer;
    }
    &:active {
        @apply bg-blue-200 text-blue-500 cursor-pointer;
    }
    &.selected {
        @apply bg-blue-200 text-blue-500 cursor-pointer;
    }
}
.admin-menu-wrapper {
    margin-top: 2.625rem;
}
</style>
