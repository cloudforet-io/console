<template>
    <vertical-page-layout>
        <template #sidebar>
            <div class="member-profile">
                <p-i v-if="userState.isDomainOwner" class="member-icon" name="root-account"
                     width="3rem" height="3rem"
                />
                <p-i v-else-if="!userState.isDomainOwner && userState.isAdmin" class="member-icon" name="admin"
                     width="3rem" height="3rem"
                />
                <p-i v-else class="member-icon" name="user"
                     width="3rem" height="3rem"
                />
                <p class="member-id">
                    {{ userState.userId }}
                </p>
                <p v-if="userState.isDomainOwner" class="member-type">
                    {{ $t('IDENTITY.USER.MAIN.ROOT_ACCOUNT') }}
                </p>
                <p v-else class="member-type">
                    {{ $t('IDENTITY.USER.MAIN.SPACEONE_USER') }}
                </p>
            </div>
            <div class="menu-title">
                {{ $t('IDENTITY.USER.MAIN.MY_ACCOUNT') }}
            </div>
            <p-divider class="menu-divider" />
            <div v-for="(item) in sidebarState.userMenuList" :key="item.label"
                 class="menu-item"
                 :class="{'selected': item.label === sidebarState.selectedItem}"
                 @click="showAccountPage(item)"
            >
                {{ item.label }}
            </div>
            <div v-if="userState.isAdmin" class="admin-menu-wrapper">
                <div class="menu-title">
                    {{$t('IDENTITY.USER.MAIN.ADMINISTRATION')}}
                </div>
                <p-divider class="menu-divider" />
                <div v-for="(item) in sidebarState.adminMenuList"
                     :key="item.label"
                     class="menu-item"
                     :class="{'selected': item.label === sidebarState.selectedItem}"
                     @click="showManagementPage(item)"
                >
                    {{ $t('IDENTITY.USER.MAIN.USER_MANAGEMENT') }}
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
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PDivider, PI } from '@spaceone/design-system';

import VerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';
import { store } from '@/store';
import router from '@/routes';
import VueI18n from 'vue-i18n';

import TranslateResult = VueI18n.TranslateResult;

interface SidebarItemType {
    label: TranslateResult;
}

export default {
    name: 'User',
    components: {
        VerticalPageLayout,
        PI,
        PDivider,
    },
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const isAdmin = vm.$store.getters['user/isAdmin'];
            if (to.name === 'user') {
                if (isAdmin) next({ name: 'userManagement', query: to.query });
                else next({ name: 'userAccount', query: to.query });
            } else if (to.name === 'userManagement' && !isAdmin) next({ name: 'userAccount', query: to.query });
            else next(to);
        });
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const userState = reactive({
            isAdmin: computed(() => store.getters['user/isAdmin']),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            userType: computed(() => store.state.user.backend) as unknown as string,
            userName: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            userId: computed(() => store.state.user.userId),
        });
        const sidebarState = reactive({
            showManagementPage: true,
            userMenuList: [
                {
                    label: vm.$t('IDENTITY.USER.MAIN.ACCOUNT_N_PROFILE'),
                },
            ],
            adminMenuList: [
                {
                    label: vm.$t('IDENTITY.USER.MAIN.USER_MANAGEMENT'),
                },
            ],
            selectedItem: '' as TranslateResult,
        });
        const showAccountPage = (item) => {
            sidebarState.selectedItem = item.label;
            vm.$router.replace({ name: 'userAccount', query: { ...router.currentRoute.query } }).catch(() => {});
        };
        const showManagementPage = (item) => {
            sidebarState.selectedItem = item.label;
            vm.$router.replace({ name: 'userManagement', query: { ...router.currentRoute.query } }).catch(() => {});
        };

        const selectSidebarItem = (routeName) => {
            if (routeName === 'userAccount') {
                sidebarState.selectedItem = sidebarState.userMenuList[0].label as TranslateResult;
            }
            if (routeName === 'userManagement') {
                sidebarState.selectedItem = sidebarState.adminMenuList[0].label as TranslateResult;
            }
        };

        watch(() => vm.$route.name, (after) => {
            selectSidebarItem(after);
        });
        (async () => {
            selectSidebarItem(vm.$route.name);
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
>>> .p-horizontal-layout .horizontal-contents {
    overflow: unset;
}
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
