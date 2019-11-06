<template>
    <div class="lnb">
        <span class="menu service-group">
            {{ serviceGroup }}
        </span>
        <span v-if="services.length > 0" class="menu">
            <f-i icon="fa-chevron-right" icon-style="light" />
        </span>
        <span
            v-for="service in services"
            :key="service.path"
            class="menu service-link"
        >
            <router-link
                router-link-active
                :to="service.path"
            >
                {{ service.label }}
            </router-link>
        </span>
    </div>
</template>

<script>
import FI from '@/components/atoms/icons/FI';

export default {
    name: 'LNBTemplate',
    components: { FI },
    data() {
        return {
            /**
             * @type String
             */
            serviceGroup: null,
            /**
             * @type Array
             * @description Array of { path: <String>, label: <String> }
             */
            services: [],
        };
    },
};
</script>

<style lang="scss" scoped>
    .lnb {
        position: relative;
        z-index: 10;
        display: flex;
        height: $lnb-height;
        box-shadow: 0px 4px 8px rgba($dark, 0.08);
        background-color: $white;
        color: $gray;
        font-size: 0.875rem;
        padding: 12px 18px;
        .menu {
            padding: 0 15px;
        }
        .service-link {
            .open.active {
                border-bottom: 2px solid $primary;
                color: $primary;
                &:hover {
                    color: $secondary;
                }
            }
            &:hover {
                color: $secondary;
            }
        }
    }
</style>
