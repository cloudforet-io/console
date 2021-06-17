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
<script lang="ts">
import PI from '@/foundation/icons/PI.vue';

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
};
</script>

<style lang="postcss">
.vue-notification-group {
    overflow: unset;
    margin: 0 2rem;
}
.vue-notification-wrapper {
    margin: 1rem 0;
    overflow: visible;
}
</style>

<style lang="postcss" scoped>
@define-mixin notice-color, $color {
    border-left: 0.25rem solid $color;
}

.p-notice-alert {
    @apply bg-white shadow-2xl box-border border border-gray-200 rounded-lg;
    min-height: 10rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    .title {
        @apply text-gray-900;
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.375;
        text-transform: capitalize;
    }
    .contents {
        font-size: 0.875rem;
        margin-top: 0.5rem;
    }
    .timestamp {
        @apply text-gray-400;
        font-size: 0.75rem;
        padding-top: 0.5rem;
    }
    &:hover {
        opacity: 0.6;
        cursor: pointer;
    }

    &.info {
        @mixin notice-color, theme('colors.primary');
    }
    &.alert {
        @mixin notice-color, theme('colors.alert');
    }
    &.warning {
        @mixin notice-color, theme('colors.yellow.500');
    }
    &.success {
        @mixin notice-color, theme('colors.safe');
    }
}
.item-type-icon {
    float: left;
    padding-right: 0.5rem;
}
</style>
