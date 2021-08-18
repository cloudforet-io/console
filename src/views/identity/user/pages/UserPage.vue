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
            <ul v-for="(item) in sidebarState.MenuList" :key="item.label"
                class="menu-item"
                :class="{'selected': item.label === sidebarState.selectedItem.label,
                         'hide': (item.userOnly && userState.isDomainOwner)
                             || item.isAdminMenu
                             || item.userOnly && !userState.hasPermission}"
                @click="showPage(item)"
            >
                <li v-if="!item.isAdminMenu">
                    {{ item.label }}
                    <span v-if="item.beta" class="beta">beta</span>
                </li>
            </ul>
            <div v-if="userState.isAdmin" class="admin-menu-wrapper">
                <div class="menu-title">
                    {{ $t('IDENTITY.USER.MAIN.ADMINISTRATION') }}
                </div>
                <p-divider class="menu-divider" />
                <ul v-for="(item) in sidebarState.MenuList"
                    :key="item.label"
                    class="menu-item"
                    :class="[{'selected': item.label === sidebarState.selectedItem.label}, {'hide': !item.isAdminMenu}]"
                    @click="showPage(item)"
                >
                    <li v-if="item.isAdminMenu">
                        {{ item.label }}
                    </li>
                </ul>
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
    computed, getCurrentInstance, reactive, watch,
} from '@vue/composition-api';

import { PDivider, PI } from '@spaceone/design-system';

import VerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';
import { store } from '@/store';
import VueI18n from 'vue-i18n';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';

import TranslateResult = VueI18n.TranslateResult;

interface SidebarItemType {
    label?: TranslateResult;
    routeName?: string;
    userOnly?: boolean;
    isAdminMenu?: boolean;
    beta?: boolean;
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
            const isDomainOwner = vm.$store.getters['user/isDomainOwner'];
            if (to.name === IDENTITY_ROUTE.USER._NAME) {
                if (isAdmin) next({ name: IDENTITY_ROUTE.USER.MANAGEMENT._NAME, query: to.query });
                else next({ name: IDENTITY_ROUTE.USER.ACCOUNT._NAME, query: to.query });
            } else if (to.name === IDENTITY_ROUTE.USER.MANAGEMENT._NAME && !isAdmin) next({ name: IDENTITY_ROUTE.USER.ACCOUNT._NAME, query: to.query });
            else if (to.name === IDENTITY_ROUTE.USER.API_KEY._NAME && isDomainOwner) next({ name: IDENTITY_ROUTE.USER.ACCOUNT._NAME, query: to.query });
            else if (to.name === IDENTITY_ROUTE.USER.NOTIFICATION._NAME && isDomainOwner) next({ name: IDENTITY_ROUTE.USER.ACCOUNT._NAME, query: to.query });
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
            hasPermission: computed((() => store.getters['user/hasPermission'])),
        });
        const sidebarState = reactive({
            showManagementPage: true,
            MenuList: [
                {
                    label: vm.$t('IDENTITY.USER.ACCOUNT.ACCOUNT_N_PROFILE'),
                    routeName: IDENTITY_ROUTE.USER.ACCOUNT._NAME,
                    userOnly: false,
                },
                {
                    label: vm.$t('IDENTITY.USER.MAIN.API_KEY'),
                    routeName: IDENTITY_ROUTE.USER.API_KEY._NAME,
                    userOnly: true,
                },
                {
                    label: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION'),
                    routeName: IDENTITY_ROUTE.USER.NOTIFICATION._NAME,
                    userOnly: true,
                    beta: true,
                },
                {
                    label: vm.$t('IDENTITY.USER.MAIN.USER_MANAGEMENT'),
                    routeName: IDENTITY_ROUTE.USER.MANAGEMENT._NAME,
                    userOnly: false,
                    isAdminMenu: true,
                },
            ],
            selectedItem: {} as SidebarItemType,
        });
        const showPage = (item) => {
            sidebarState.selectedItem = item;
            vm.$router.replace({ name: item.routeName, query: { ...vm.$route.query } }).catch(() => {});
        };
        const selectSidebarItem = (routeName) => {
            if (routeName === IDENTITY_ROUTE.USER.API_KEY._NAME && !userState.isDomainOwner) {
                sidebarState.selectedItem = sidebarState.MenuList[1];
            } else if (routeName) sidebarState.selectedItem = sidebarState.MenuList.find(d => d.routeName === routeName) as SidebarItemType;
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
            showPage,
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
    &.hide {
        display: none;
    }
    .beta {
        @apply text-coral-500;
        font-size: 0.75rem;
        line-height: 120%;
        margin-left: 0.25rem;
        vertical-align: top;
    }
}
.admin-menu-wrapper {
    margin-top: 2.625rem;
}
</style>
