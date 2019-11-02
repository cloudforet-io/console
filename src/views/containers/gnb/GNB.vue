<template>
    <ul class="menu-container">
        <li>
            <p-tooltip contents="Dashboard"
                       :options="{offset: '8px'}"
            >
                <template #target>
                    <router-link class="logo" to="/dashboard">
                        MZC
                    </router-link>
                </template>
            </p-tooltip>
        </li>
        <li>
            <site-map />
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
import SiteMap from './modules/SiteMap';
import LanguageMenu from './modules/LanguageMenu';
import AccountMenu from './modules/AccountMenu';

export default {
    name: 'GNB',
    components: {
        PTooltip, SiteMap, LanguageMenu, AccountMenu,
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
        .logo {
            display: inline-block;
            line-height: 40px;
            text-align: center;
            width: 40px;
            height: 40px;
            padding: 0;
            border-radius: 50%;
            background-color: $white;
            color: $primary;
            font-size: 0.875rem;
            font-weight: bold;
        }
    }
}
</style>
