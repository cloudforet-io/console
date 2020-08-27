<template>
    <div class="sitemap-container">
        <div class="sitemap-button"
             :active="visible"
             @click="toggle"
        >
            <p-i class="sitemap-icon"
                 name="ic_gnb_service_2"
                 color="inherit transparent"
                 width="2rem" height="2rem"
            />
        </div>
        <div v-if="visible" v-click-outside="hide" class="sitemap">
            <ul v-for="(aItem, aIdx) in allMenu"
                :key="aIdx"
            >
                <router-link :to="aItem.link">
                    <li class="menu" @click="hide">
                        {{ aItem.label }}
                    </li>
                </router-link>
                <div v-if="aItem.subMenus.length > 0">
                    <div v-for="(sItem, sIdx) in aItem.subMenus"
                         :key="sIdx"
                    >
                        <div v-if="!sItem.isAdminMenu || isDomainOwner">
                            <router-link v-if="sItem" :to="sItem.link">
                                <li class="submenu" @click="hide">
                                    {{ sItem.label }}
                                </li>
                            </router-link>
                        </div>
                    </div>
                </div>
            </ul>
        </div>
    </div>
</template>

<script>
import vClickOutside from 'v-click-outside';
import { reactive, toRefs } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'SiteMap',
    components: {
        PI,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        isDomainOwner: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({
            visible: false,
            allMenu: [
                {
                    label: 'Dashboard', link: '/dashboard', subMenus: [],
                },
                {
                    label: 'Project', link: '/project', subMenus: [],
                },
                {
                    label: 'Inventory',
                    link: '/inventory',
                    subMenus: [
                        { label: 'Server', link: '/inventory/server' },
                        { label: 'Cloud Service', link: '/inventory/cloud-service' },
                    ],
                },
                {
                    label: 'Identity',
                    link: '/identity',
                    subMenus: [
                        { label: 'Service Account', link: '/identity/service-account' },
                        { label: 'User', link: '/identity/user' },
                    ],
                },
                {
                    label: 'Plugin',
                    link: '/plugin',
                    subMenus: [
                        { label: 'Collector', link: '/plugin/collector' },
                    ],
                },
                {
                    label: 'Management',
                    link: '/management',
                    subMenus: [
                        { label: 'Plugin', link: '/management/supervisor/plugins', isAdminMenu: true },
                        { label: 'Collector History', link: '/management/collector-history' },
                    ],
                },
            ],
        });

        return {
            ...toRefs(state),
            show() { state.visible = true; },
            hide() { state.visible = false; },
            toggle() { state.visible = !state.visible; },
        };
    },
};
</script>

<style lang="postcss" scoped>
.sitemap-container {
    .sitemap-button {
        @apply relative cursor-pointer;
        text-decoration: none;
        opacity: 0.5;
        &.opened, &:hover {
            @apply text-primary opacity-100;
            .sitemap-icon {
                @apply bg-primary4
            }
        }
        .sitemap-icon {
            @apply rounded-full;
            width: 2rem;
            height: 2rem;
        }
    }

    .sitemap {
        @apply bg-white border border-gray-200 text-gray-900 text-sm;
        position: absolute;
        top: 2.5rem;
        left: 0;
        width: 14rem;
        box-shadow: 0 0 14px rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
        z-index: 10;
        li {
            @apply cursor-pointer;
            display: block;
            line-height: 1.5rem;
            padding: 0.5rem;
            &:hover {
                @apply text-primary bg-primary4
            }
            &.menu {
                @apply font-bold;
            }
            &.submenu {
                padding-left: 1rem;
            }
        }
    }
}
</style>
