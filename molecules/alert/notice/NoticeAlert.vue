<template>
    <notifications :group="group"
                   :position="position"
                   :style="dynamicStyle"
                   close-on-click
                   classes="notice-alert"
    >
        <template #body="notifyParam">
            <div :class="getThisProp(notifyParam)"
                 @click="notifyParam.close"
            >
                <a class="title">
                    {{ notifyParam.item.title }}
                </a>

                <p-i v-if="getItemType(notifyParam)" name="ic_alert"
                     style="float:right"
                     :color="exclamation"
                     width="1.5rem"
                     height="1.5rem"
                />
                <div class="content" v-html="notifyParam.item.text" />
            </div>
        </template>
    </notifications>
</template>
<script>
import PI from '@/components/atoms/icons/PI';
import styles from '@/styles/_variables.scss';

export default {
    name: 'PNoticeAlert',
    components: {
        PI,
    },
    props: {
        type: {
            type: String,
            default: 'dual',
        },
        group: {
            type: String,
            default: '',
        },
        position: {
            type: String,
            default: 'bottom right',
        },
        dynamicStyle: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            exclamation: styles.alert,
        };
    },
    methods: {
        getThisProp(givenProp) {
            return `notice-alert ${givenProp.item.type}`;
        },
        getItemType(givenProp) {
            return givenProp.item.type === 'alert';
        },
    },
};
</script>
<style lang="scss">
    .vue-notification-group{
        width: 24rem !important;
    }

    .notice-alert {
        height: 10rem !important;
        margin: 2rem 2rem 2rem 2rem;
        color: $dark;
        background: white;

        &.alert {
            border-radius: 2px;
            background: #FFFFFF 0% 0% no-repeat padding-box;
            box-shadow: 0px 0px 8px #4D49B629;
            border: 1px solid $alert !important;
            opacity: 1;

            .title {
                text-align: left;
                text-decoration: underline;
                font: Bold 16px/18px Arial;
                letter-spacing: 0;
                color: $alert;
                opacity: 1;

            }

            .content {
                margin-top: 1rem;
                text-align: left;
                font: 14px/17px Arial;
                letter-spacing: 0;
                color: $dark;
                opacity: 1;
            }

            &:hover {
                cursor:pointer;
                border: 2px solid #EA390F !important;
            }
        }

        &.success {
            padding: 1rem;
            border-radius: 2px;
            background: #FFFFFF 0% 0% no-repeat padding-box;
            box-shadow: 0px 0px 8px #4D49B629;
            border: 1px solid $safe !important;
            opacity: 1;

            .title {
                text-align: left;
                text-decoration: underline;
                font: Bold 16px/18px Arial;
                letter-spacing: 0;
                color: $safe;
                opacity: 1;

            }

            .content {
                margin-top: 1rem;
                text-align: left;
                font: 14px/17px Arial;
                letter-spacing: 0;
                color: $dark;
                opacity: 1;
            }

            &:hover {
                cursor:pointer;
                border: 2px solid $safe !important;
            }
        }

        &.warning {
            padding: 1rem;
            border-radius: 2px;
            background: #FFFFFF 0% 0% no-repeat padding-box;
            box-shadow: 0px 0px 8px #4D49B629;
            border: 1px solid $other1 !important;
            opacity: 1;

            .title {
                text-align: left;
                text-decoration: underline;
                font: Bold 16px/18px Arial;
                letter-spacing: 0;
                color:  $other1;
                opacity: 1;

            }

            .content {
                margin-top: 1rem;
                text-align: left;
                font: 14px/17px Arial;
                letter-spacing: 0;
                color: $dark;
                opacity: 1;
            }

            &:hover {
                cursor:pointer;
                border: 2px solid $other1 !important;
            }
        }
    }


</style>
