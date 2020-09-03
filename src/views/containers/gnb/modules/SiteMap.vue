<template>
    <div class="sitemap-container">
        <div class="sitemap-button" :class="visible ? 'visible' : ''" @click="toggle">
            <p-i class="sitemap-icon" :name="visible ? 'ic_delete' : 'ic_gnb_service_2'"
                 :color="visible ? 'transparent inherit' : 'inherit transparent'"
                 width="2rem" height="2rem"
            />
        </div>
        <div v-if="visible" v-click-outside="hide" class="sitemap">
            <ul v-for="(aItem, aIdx) in allMenu"
                :key="aIdx"
            >
                <router-link :to="aItem.link">
                    <li class="menu" @click="hide">
                        <p-i :name="aItem.icon"
                             color="inherit inherit"
                             height="1.5rem" width="1.5rem"
                        /> {{ aItem.label }}
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
                                    <span v-if="sItem.isNew" class="new-text">new</span>
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
import { reactive, toRefs, computed } from '@vue/composition-api';
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
        visible: {
            type: Boolean,
            default: false,
        },
        isDomainOwner: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            allMenu: computed(() => [
                {
                    label: 'Dashboard', link: '/dashboard', subMenus: [], icon: 'ic_dashboard',
                },
                {
                    label: 'Project', link: '/project', subMenus: [], icon: 'ic_project',
                },
                {
                    label: 'Inventory',
                    link: '/inventory',
                    icon: 'ic_inventory',
                    subMenus: [
                        { label: 'Server', link: '/inventory/server' },
                        { label: 'Cloud Service', link: '/inventory/cloud-service' },
                    ],
                },
                {
                    label: 'Identity',
                    link: '/identity',
                    icon: 'ic_identity',
                    subMenus: [
                        { label: 'Service Account', link: '/identity/service-account' },
                        { label: 'User', link: '/identity/user' },
                    ],
                },
                {
                    label: 'Plugin',
                    link: '/plugin',
                    icon: 'ic_plugin',
                    subMenus: [
                        { label: 'Collector', link: '/plugin/collector' },
                    ],
                },
                {
                    label: 'Management',
                    link: props.isDomainOwner ? '/management' : '/management/collector-history',
                    icon: 'ic_management',
                    subMenus: [
                        { label: 'Plugin (admin)', link: '/management/supervisor/plugins', isAdminMenu: true },
                        { label: 'Collector History', link: '/management/collector-history', isNew: true },
                        { label: 'Power Scheduler', link: '/management/power-scheduler', isNew: true },
                    ],
                },
            ]),
        });

        return {
            ...toRefs(state),
            show() { emit('update:visible', true); },
            hide() { emit('update:visible', false); },
            toggle() { emit('update:visible', !props.visible); },
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
        &:hover {
            @apply text-primary opacity-100;
            .sitemap-icon {
                @apply bg-primary4;
            }
        }
        &.visible {
            opacity: 1;
            @apply text-primary;
        }
        .sitemap-icon {
            @apply rounded-full;
        }
    }

    .sitemap {
        @apply bg-white border border-gray-200 text-gray-900 text-sm;
        position: absolute;
        top: 2.5rem;
        left: 0;
        width: 15rem;
        box-shadow: 0 0 14px rgba(0, 0, 0, 0.1);
        z-index: 10;
        padding: 1.5rem 0;
        ul:first-child .menu {
            margin-top: 0;
        }
        li {
            @apply cursor-pointer;
            display: block;
            font-size: 0.875rem;
            &:hover {
                @apply text-primary;
                transition: all ease 0.3s;
                &.menu .p-i-icon {
                    @apply text-primary;
                    transition: all ease 0.3s;
                }
            }
            &.menu {
                @apply font-bold;
                line-height: 2rem;
                padding-left: 1.5rem;
                margin-top: 1.5rem;
                .p-i-icon {
                    @apply text-primary-dark;
                    margin-right: 0.25rem;
                }
            }
            &.submenu {
                @apply text-gray-500;
                line-height: 1.75rem;
                padding-left: 3.5rem;
                &:hover {
                    @apply text-primary;
                    transition: all ease 0.3s;
                }
                .new-text {
                    font-size: 0.75rem;
                    background: linear-gradient(to right, theme('colors.primary'), 50%, theme('colors.secondary'));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    vertical-align: super;
                    cursor: default;
                }
            }
        }
    }
}
</style>
