<template>
    <div class="sitemap-container">
        <p-tooltip-button tooltip="Services"
                          :tooltip-options="{offset: '20px'}"
                          :active="visible"
                          @click="toggle"
        >
            <template #buttonContents>
                <p-i name="ic_gnb_services" width="32px" height="32px"
                     :color="`transparent ${iconColor}`"
                />
            </template>
        </p-tooltip-button>

        <div v-if="visible" class="sitemap">
            <div class="title">
                <p-button class="back-btn" @click="hide">
                    <template>
                        <p-i name="ic_back" width="24px" height="24px" />
                    </template>
                </p-button>
                <span class="name">Services</span>
            </div>

            <ul @click="hide">
                <li>
                    <router-link class="group" to="/dashboard">
                        <span class="icon">
                            <p-i name="ic_dashboard" width="24px" height="24px"
                                 color="transparent inherit"
                            />
                        </span>
                        <span class="name">Dashboard</span>
                    </router-link>
                </li>

                <li>
                    <router-link class="group" to="/inventory">
                        <span class="icon">
                            <p-i name="ic_inventory" width="24px" height="24px"
                                 color="transparent inherit"
                            />
                        </span>
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
                        <span class="icon">
                            <p-i name="ic_identity" width="24px" height="24px"
                                 color="transparent inherit"
                            />
                        </span>
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
                <li>
                    <router-link class="group" to="/secret">
                        <span class="icon">
                            <p-i name="ic_identity" width="24px" height="24px"
                                 color="transparent inherit"
                            />
                        </span>
                        <span class="name">Secret</span>
                    </router-link>
                </li>

                <li>
                    <router-link class="service" to="/secret/credentials-group">
                        Credentials Group
                    </router-link>
                </li>
                <li>
                    <router-link class="service" to="/secret/credentials">
                        Credentials
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
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton';
import PButton from '@/components/atoms/buttons/Button';
import PI from '@/components/atoms/icons/PI';
import styles from '@/styles/_variables.scss';

export default {
    name: 'SiteMap',
    components: {
        PButton,
        PI,
        PTooltipButton,
    },
    data() {
        return {
            visible: false,
            iconColor: styles.primary4,
        };
    },
    methods: {
        show() {
            this.visible = true;
        },
        hide() {
            this.visible = false;
        },
        toggle() {
            this.visible = !this.visible;
        },
    },
};
</script>

<style lang="scss" scoped>
    $sitemap-width: 260px;
.sitemap-container {
    .activator {
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        min-width: 32px;
        height: 32px;
        color: $primary4;
        &:hover, &.active {
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
        text-align: left;
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
                min-width: 24px;
                height: 24px;
                border-radius: 2px;
                border: 0px;
                &:hover {
                    background-color: $primary3;
                }
            }
        }
        ul {
            all:unset;
        }
        li {
            all:unset;
            display: block;
            cursor: pointer;
            &:hover {
                background: $primary3;
                .icon {
                    color: $primary;
                }
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
            vertical-align: middle;
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
