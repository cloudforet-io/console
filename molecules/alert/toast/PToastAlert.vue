<template>
    <notifications
        class="notification-group"
        :group="group"
        :position="position"
        :close-on-click="false"
    >
        <template #body="{item, close}">
            <div class="p-notice-alert" :class="item.type"
                 @click="close"
            >
                <div class="icon-lap">
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
                </div>
                <div class="content-lap" :class="[item.type === 'info' ? 'ml-2' : '']">
                    <a class="title">{{ item.title }}</a>
                    <div v-if="item.text" class="contents">
                        {{ item.text }}
                    </div>
                </div>
                <div v-if="isClosedWithButton" class="button-lap">
                    <p-i name="ic_delete"
                         class="delete-icon"
                         width="1.2rem" height="1.2rem"
                         color="transparent white"
                    />
                </div>
            </div>
        </template>
    </notifications>
</template>

<script lang="ts">
import PI from '@/components/atoms/icons/PI.vue';

/**
 * Used library: vue-notification
 * https://www.npmjs.com/package/vue-notification
 */

export default {
    name: 'PToastAlert',
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
        isClosedWithButton: {
            type: Boolean,
            default: true,
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
.notification-group {
    margin-top: 4.5rem;
}
.p-notice-alert {
    @apply bg-gray-900;
    position: relative;
    display: inline-flex;
    border-radius: 0.125rem;
    opacity: 0.88;
    padding: 0.55rem;

    .content-lap {
        display: grid;
        width: 20rem;
        .title {
            @apply text-white;
            font-size: 1rem;
            line-height: 1.375;
            text-transform: capitalize;
        }
        .contents {
            @apply text-gray-300;
            font-size: 0.875rem;
        }
    }
    .button-lap {
        margin: auto 0 auto 0.5rem;
        .delete-icon {
            &:hover {
                cursor: pointer;
            }
        }
    }
}
.item-type-icon {
    float: left;
    padding-right: 0.5rem;
}
</style>
