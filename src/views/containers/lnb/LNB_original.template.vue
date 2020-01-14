<template>
    <div class="lnb">
        <span class="menu service-group">
            {{ serviceGroup }}
        </span>
        <span v-if="services.length > 0" class="menu">
            <p-i name="ic_breadcrum_arrow" />
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
import { ref } from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'LNBTemplate',
    components: { PI },
    setup() {
        return {
            /**
             * @type String
             */
            serviceGroup: ref(null),
            /**
             * @type Array{Object<{path: {String}, label: {String}, hasChildren: {Boolean}, children: {Array<...>} }>}
             */
            services: ref([]),
        };
    },
};
</script>

<style lang="scss" scoped>
    .lnb {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        height: $lnb-height;
        box-shadow: 0px 4px 8px rgba($dark, 0.08);
        background-color: $white;
        color: $gray;
        font-size: 0.875rem;
        padding: 12px 18px;
        .menu {
            padding: 0 .5rem;
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
