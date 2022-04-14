<template>
    <div v-if="userState.isAdmin" class="administration-lnb">
        <div class="menu-title">
            IAM
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

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import {
    ComponentRenderProxy,
    computed,
    defineComponent,
    getCurrentInstance,
    reactive,
    watch,
} from '@vue/composition-api';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import { PDivider } from '@spaceone/design-system';
import { store } from '@/store';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

interface SidebarItemType {
    label?: TranslateResult;
    routeName?: string;
    userOnly?: boolean;
    isAdminMenu?: boolean;
    beta?: boolean;
}


export default defineComponent({
    name: 'AdministrationLNB',
    components: {
        VerticalPageLayout,
        PDivider,
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
                    label: 'User',
                    routeName: ADMINISTRATION_ROUTE.IAM.USER._NAME,
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
            if (routeName) sidebarState.selectedItem = sidebarState.MenuList.find(d => d.routeName === routeName) as SidebarItemType;
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
});

</script>

<style lang="postcss" scoped>
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
        @apply bg-blue-200 text-blue-600 cursor-pointer;
    }
    &.selected {
        @apply bg-blue-200 text-blue-600 cursor-pointer;
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
.administration-lnb {
    margin-top: 2.625rem;
}
</style>
