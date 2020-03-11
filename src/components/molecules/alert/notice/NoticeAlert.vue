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
                <a class="title">{{ item.title }}</a>

                <p-i v-if="item.type === 'alert'" name="ic_alert"
                     class="alert-icon"
                     width="1.5rem"
                     height="1.5rem"
                />
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
        margin: 2rem 0;
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
        @apply bg-white shadow-2xl;
        min-height:160px;
        padding: 1.5rem;
        .title {
            font-size: 1.125rem;
            line-height: 1.375;
            font-weight: bold;
            text-transform: capitalize;
            text-decoration: underline;
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
        @mixin notice-color warning, theme('colors.other1');
        @mixin notice-color success, theme('colors.safe');
    }
    .alert-icon {
        float: right;
    }
</style>
