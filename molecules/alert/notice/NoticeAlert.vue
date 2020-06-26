<template>
    <notifications :group="group"
                   :position="position"
                   width="326px"
                   close-on-click
    >
        <template #body="{item, close}">
            <div class="p-notice-alert" :class="item.type"
                 @click="close"
            >
                <p-i v-if="item.type === 'success'" name="ic_state_active"
                     class="item-type-icon"
                     width="1.5rem"
                     height="1.5rem"
                />
                <p-i v-if="item.type === 'warning'" name="ic_list_duplication"
                     class="item-type-icon"
                     width="1.5rem"
                     height="1.5rem"
                />
                <p-i v-if="item.type === 'alert'" name="ic_alert"
                     class="item-type-icon"
                     width="1.5rem"
                     height="1.5rem"
                />
                <a class="title">{{ item.title }}</a>
                <div class="contents">
                    {{ item.text }}
                </div>
            </div>
        </template>
    </notifications>
</template>
<script>
import PI from '@/components/atoms/icons/PI.vue';

/**
 * Used library: vue-notification
 * https://www.npmjs.com/package/vue-notification
 */

export default {
    name: 'PNoticeAlert',
    components: {
        PI,
    },
    props: {
        group: {
            type: String,
            default: '',
        },
        position: {
            type: String,
            default: 'bottom right',
        },
    },
    data() {
        return {
        };
    },
    methods: {
    },
};
</script>

<style lang="postcss">
    .vue-notification-group {
        overflow: unset;
        margin: 0 2rem;
    }
    .vue-notification-wrapper {
        margin: 1rem 0rem;
        overflow: visible;
    }
</style>

<style lang="postcss" scoped>
    @define-mixin notice-color $theme, $color {
        &.$(theme) {
            border: 1px solid $color;
            .title {
                color: $color;
            }
        }
    }

    .p-notice-alert {
        @apply bg-white shadow-2xl rounded-sm box-border p-6 border border-gray-200;
        min-height:160px;
        box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.08);
        .title {
            @apply text-gray-900;
            font-size: 1.125rem;
            line-height: 1.375;
            font-weight: bold;
            text-transform: capitalize;
        }
        .contents {
            margin-top: 1rem;
            font-size: .875rem;
            text-transform: capitalize;
        }
        &:hover {
            opacity: .6;
            cursor: pointer;
        }

        @mixin notice-color alert, theme('colors.alert');
        @mixin notice-color warning, theme('colors.coral.default');
        @mixin notice-color success, theme('colors.safe');
    }
    .item-type-icon {
        float: left;
        padding-right: 0.5rem;
    }
</style>
