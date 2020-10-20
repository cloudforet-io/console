<template>
    <notifications
        class="p-toast-alert"
        :group="group"
        :position="position"
        width="320"
        :close-on-click="false"
    >
        <template #body="{item, close}">
            <div class="alert-contents" :class="item.type"
                 @click="close"
            >
                <div class="icon-wrapper">
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
                <div class="content-wrapper" :class="[item.type === 'info' ? 'ml-2' : '']">
                    <a class="title">{{ item.title }}</a>
                    <div v-if="item.text" class="contents">
                        {{ item.text }}
                    </div>
                </div>
                <div v-if="isClosedWithButton" class="button-wrapper">
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
    }
    .vue-notification-wrapper {
        margin: 1rem 0;
        overflow: visible;
    }
</style>

<style lang="postcss">
.p-toast-alert {
    margin-top: 4.5rem;
    margin-left: 0;
    margin-right: 0;
    overflow-y: hidden;

    .alert-contents {
        @apply bg-gray-900;
        position: relative;
        display: flex;
        border-radius: 0.125rem;
        opacity: 0.88;
        padding: 0.55rem;
    }

    .icon-wrapper {
        flex-shrink: 0;
    }
    .item-type-icon {
        float: left;
        padding-right: 0.5rem;
    }

    .content-wrapper {
        flex-grow: 1;
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

    .button-wrapper {
        margin: auto 0 auto 0.5rem;
        flex-shrink: 0;
        .delete-icon {
            &:hover {
                cursor: pointer;
            }
        }
    }

}
</style>
