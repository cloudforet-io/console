<template>
    <ul class="menu-container">
        <li class="logo">
            <p-tooltip contents="Dashboard"
                       :options="{offset: '8px'}"
                       @click="hideSitemap"
            >
                <template #target>
                    <router-link to="/dashboard">
                        <p-i name="btn_gnb_top-logo" width="56px" height="56px" />
                    </router-link>
                </template>
            </p-tooltip>
        </li>
        <li>
            <site-map ref="sitemap" />
        </li>
        <li class="menu-3">
            <language-menu />
        </li>
        <li>
            <account-menu />
        </li>
    </ul>
</template>

<script>
import PTooltip from '@/components/molecules/tooltips/Tooltip';
import PI from '@/components/atoms/icons/PI';
import SiteMap from './modules/SiteMap';
import LanguageMenu from './modules/LanguageMenu';
import AccountMenu from './modules/AccountMenu';

export default {
    name: 'GNB',
    components: {
        PI, PTooltip, SiteMap, LanguageMenu, AccountMenu,
    },
    methods: {
        hideSitemap() {
            if (this.$refs.sitemap && this.$refs.sitemap.visible) {
                this.$refs.sitemap.hide();
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.menu-container {
    display: flex !important;
    flex-flow: column;
    background-color: $primary;
    color: $primary4;
    li {
        flex-grow: 1;
        padding: 12px 0;
        text-align: center;
        &:first-child {
            padding-top: 16px;
            flex-grow: 0;
        }
        &:last-child {
            padding-bottom: 16px;
            flex-grow: 0;
        }
        &.menu-3 {
            flex-grow: 0;
        }
    }
}
</style>
