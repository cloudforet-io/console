<template>
    <ul class="menu-container">
        <li>
            <p-button class="logo">
                <template>
                    MZC
                </template>
            </p-button>
        </li>
        <li>
            <site-map />
        </li>
        <li>
            <p-button >
                <template>
                    language
                </template>
            </p-button>
        </li>
        <li>
            <p-button >
                <template>
                    account
                </template>
            </p-button>
        </li>
    </ul>
</template>

<script>
import SiteMap from './modules/SiteMap';
import PButton from '@/components/atoms/buttons/Button';

export default {
    name: 'GNB',
    components: { SiteMap, PButton },
};
</script>

<style lang="scss" scoped>
.menu-container {
    display: flex !important;
    flex-direction: column;
    background-color: $primary;
    color: $primary4;
    padding: 16px 0;
    align-items: center;
    li {
        border: 1px solid palevioletred;
        padding: 12px 0;
        .logo {
            display: inline-block;
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
