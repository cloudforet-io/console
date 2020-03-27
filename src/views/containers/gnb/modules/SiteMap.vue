<template>
    <div class="sitemap-container">
        <p-tooltip-button tooltip="Services"
                          :tooltip-options="{offset: '20px'}"
                          :active="visible"
                          @click="toggle"
        >
            <template #buttonContents>
                <p-i class="service-icon" name="ic_gnb_services"
                     width="2rem" height="2rem"
                     color="transparent inherit"
                />
            </template>
        </p-tooltip-button>

        <div v-if="visible" class="sitemap">
            <div class="title">
                <p-button class="back-btn" @click="hide">
                    <template>
                        <p-i name="ic_back" width="2rem" height="2rem" />
                    </template>
                </p-button>
                <span class="name">Services</span>
            </div>

            <ul @click="hide">
                <li>
                    <router-link class="group" to="/dashboard">
                        <span class="icon">
                            <p-i name="ic_dashboard"
                                 color="transparent inherit"
                            />
                        </span>
                        <span class="name">Dashboard</span>
                    </router-link>
                </li>

                <li>
                    <router-link class="group" to="/inventory">
                        <span class="icon">
                            <p-i name="ic_inventory"
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
                    <router-link class="service" to="/inventory/cloud-service">
                        Cloud Service
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
                            <p-i name="ic_identity"
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
<!--                <li>-->
<!--                    <router-link class="service last" to="/identity/cloud-account">-->
<!--                       Cloud Account-->
<!--                    </router-link>-->
<!--                </li>-->
                <li>
                    <router-link class="group" to="/secret">
                        <span class="icon">
                            <p-i name="ic_secret"
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
<!--                <li>-->
<!--                    <router-link class="group" to="/plugin">-->
<!--                        <span class="icon">-->
<!--                            <p-i name="ic_identity"-->
<!--                                 color="transparent inherit"-->
<!--                            />-->
<!--                        </span>-->
<!--                        <span class="name">Plugin</span>-->
<!--                    </router-link>-->
<!--                </li>-->

<!--                <li>-->
<!--                    <router-link class="service" to="/plugin/supervisor">-->
<!--                        Supervisor-->
<!--                    </router-link>-->
<!--                </li>-->
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
import { reactive, toRefs, defineComponent } from '@vue/composition-api';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'SiteMap',
    components: {
        PButton,
        PI,
        PTooltipButton,
    },
    setup(props) {
        const state = reactive({
            visible: false,
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
    $sitemap-width: 260px;
.sitemap-container {
    .service-icon {
        @apply text-primary4;
    }
    .activator {
        @apply text-primary4;
        display: inline-block;
        padding: 0;
        border-radius: 2px;
        min-width: 2rem;
        height: 2rem;
        &:hover, &.active {
            @apply bg-primary-dark;
        }
    }

    .sitemap {
        @apply bg-primary4 text-dark;
        position: fixed;
        left: $gnb-width;
        top: 0;
        height: 100vh;
        width: $sitemap-width;
        overflow: hidden;
        box-shadow: 4px 0 8px rgba(theme('colors.dark'), 0.32);
        text-align: left;
        .title {
            @apply text-gray;
            display: flex;
            align-items: center;
            font-size: 1rem;
            padding: 1rem 1.75rem;
            font-weight: bold;
            line-height: 1.5rem;
            .name {
                padding-left: .5rem;
            }
            .back-btn {
                padding: 0;
                vertical-align: unset;
                min-width: 2rem;
                height: 2rem;
                border-radius: 2px;
                border: 0;
                &:hover {
                    @apply bg-primary3;
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
                @apply bg-primary3;
                .icon {
                    @apply text-primary;
                }
            }
            a {
                display: block;
            }
        }

        .group {
            @apply border-t border-gray3;
            padding: 1rem 1.75rem;
            font-size: 1rem;
            font-weight: bold;
            vertical-align: middle;
            .name {
                padding-left: .5rem;
            }
            .icon {
                display: inline-block;
                margin-left: .5rem;
                text-align: center;
                color: inherit;
                width: 1.5rem;
                max-height: 241.5rem;
            }
        }
        .service {
            padding: .5rem  0 .5rem 4.5rem;
            &.last {
                margin-bottom: 1rem;
            }
        }
    }
    .backdrop {
        position: fixed;
        left: calc($(gnb-width) + $(sitemap-width));
        top: 0;
        height: 100vh;
        width: calc(100vw - $(gnb-width) - $(sitemap-width));
        background-color: rgba(theme('colors.dark'), 0.32);
        overflow: hidden;
    }
}
</style>
