<template>
    <div class="sitemap-container">
        <p-button class="activator" @click="show">
            <template>
                <f-i icon="fa-archive" />
            </template>
        </p-button>

        <div v-if="visible" class="sitemap">
            <div class="title">
                <p-button class="back-btn" @click="hide">
                    <template>
                        <i class="p-icon p-i-ic_back" />
                    </template>
                </p-button>
                <span class="name">Services</span>
            </div>

            <ul @click="hide">
                <li>
                    <router-link class="group" to="/dashboard">
                        <span class="icon"><i class="p-icon p-i-ic_dashboard" /></span>
                        <span class="name">Dashboard</span>
                    </router-link>
                </li>

                <li>
                    <router-link class="group" to="/inventory">
                        <span class="icon"><f-i icon="fa-archive" /></span>
                        <span class="name">Inventory</span>
                    </router-link>
                </li>

                <li>
                    <router-link class="service" to="/inventory/data-center">
                        Data Center
                    </router-link>
                </li>

                <li>
                    <router-link class="service" to="/inventory/server">
                        Server
                    </router-link>
                </li>
                <li>
                    <router-link class="service last" to="/inventory/collector">
                        Collector
                    </router-link>
                </li>

                <li>
                    <router-link class="group" to="/identity">
                        <span class="icon"><f-i icon="fa-archive" /></span>
                        <span class="name">Identity</span>
                    </router-link>
                </li>

                <li>
                    <router-link class="service" to="/identity/user">
                        User
                    </router-link>
                </li>
                <li>
                    <router-link class="service" to="/identity/project">
                        Project
                    </router-link>
                </li>
            </ul>
        </div>
        <div
            v-if="visible"
            class="backdrop"
            @click.stop="hide"
        />
    </div>
</template>

<script>
import PButton from '@/components/atoms/buttons/Button';
import FI from '@/components/atoms/icons/FI';

export default {
    name: 'SiteMap',
    components: {
        PButton,
        FI,
    },
    data() {
        return {
            visible: false,
        };
    },
    methods: {
        show() {
            this.visible = true;
        },
        hide() {
            this.visible = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    $sitemap-width: 260px;
.sitemap-container {
    text-align: center;
    .activator {
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        width: 32px;
        height: 32px;
        color: $primary4;
        &:hover {
            background-color: $primary-dark;
        }
    }

    .sitemap {
        position: fixed;
        left: $gnb-width;
        top: 0;
        height: 100vh;
        width: $sitemap-width;
        background-color: $primary4;
        overflow: hidden;
        box-shadow: 4px 0 8px rgba($dark, 0.32);
        color: $dark;
        .title {
            font-size: 1rem;
            padding: 1rem 1.75rem;
            color: $gray;
            font-weight: bold;
            line-height: 24px;
            .name {
                padding-left: 0.43rem;
            }
            .back-btn {
                padding: 0;
                vertical-align: unset;
                height: 24px;
                width: 24px;
                border-radius: 2px;
                &:hover {
                    background-color: $primary3;
                }
            }
        }
        li {
            display: block;
            cursor: pointer;
            &:hover {
                background: $primary3;
            }
            a {
                display: block;
            }
        }

        .group {
            border-top: 1px solid $gray3;
            padding: 1rem 1.75rem;
            font-size: 1rem;
            font-weight: bold;
            .name {
                padding-left: 0.43rem;
            }
            .icon {
                display: inline-block;
                text-align: center;
                color: inherit;
                width: 24px;
                max-height: 24px;
            }
        }
        .service {
            padding: .5rem 3.5rem;
            &.last {
                padding-bottom: .75rem;
            }
        }
    }
    .backdrop {
        position: fixed;
        left: calc(#{$gnb-width} + #{$sitemap-width});
        top: 0;
        height: 100vh;
        width: calc(100vw - #{$gnb-width} - #{$sitemap-width});
        background-color: rgba($dark, 0.32);
        overflow: hidden;
    }
}
</style>
