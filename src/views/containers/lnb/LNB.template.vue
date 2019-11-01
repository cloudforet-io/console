<template>
    <div class="lnb">
        <span class="service-group">
            {{ serviceGroup }}
        </span>
        <span
            v-for="service in services"
            :key="service.path"
            class="service-link"
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
export default {
    name: 'LNBTemplate',
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
        height: $lnb-height;
        border: 1px solid green;

        .service-link {
            .open.active {
                border-bottom: 2px solid red;
            }
        }
    }
</style>
