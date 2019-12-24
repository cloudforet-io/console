import { action } from '@storybook/addon-actions';
import PNoticeAlert from '@/components/molecules/alert/notice/NoticeAlert';

export default {
    title: 'molecules/alert/noticeAlert',
    component: PNoticeAlert,
    parameters: {
        info: {
            summary: '',
            components: { PNoticeAlert },
        },
    },
};

const data = {

};

const actions = {
};

export const modal = () => ({
    components: { PNoticeAlert },
    template: `<div>
                    <button @click="showAction">Launch alert</button>
                </div>
               `,
    data() {
        return {
            ...data,
        };
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
    methods: {
        showAction() {
            this.$notify({
                group: 'noticeBottomRight',
                type: 'alert',
                title: 'Fail',
                text: 'This is Type: alert',
                duration: 2000,
                speed: 1000,
            });
        },
        ...actions,
    },
});
