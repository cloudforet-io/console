import Vue from 'vue';
import { text, select } from '@storybook/addon-knobs';
import PNoticeAlert from '@/molecules/alert/notice/PNoticeAlert.vue';

export default {
    title: 'Feedbacks/Alert/Notice',
    component: PNoticeAlert,
    parameters: {
        info: {
            summary: 'Pop up notification with its flag in \'Success\', \'Fail\', and \'Warning\'. ',
            components: { PNoticeAlert },
        },
    },
};

export const noticeAlert = () => ({
    components: { PNoticeAlert },
    template: `
        <div>
            <div> 
                <p-notice-alert group="noticeTopLeft" position="top left" />
                <p-notice-alert group="noticeTopRight" position="top right" />
                <p-notice-alert group="noticeBottomLeft" position="bottom left" />
                <p-notice-alert group="noticeBottomRight" position="bottom right" />
            </div>
            <div>
                <button @click="displayNotice">Launch Notice Alert</button>
            </div>
        </div>`,
    props: {
        title: {
            default: text('title', 'This is Title.'),
        },
        alertPosition: {
            default: select('Position', ['noticeBottomLeft', 'noticeBottomRight', 'noticeTopLeft', 'noticeTopRight'], 'noticeBottomLeft'),
        },
        alertType: {
            default: select('Alert Type', ['alert', 'success', 'warning', 'info'], 'alert'),
        },
        contents: {
            default: text('text', 'This is Contents.'),
        },
    },
    setup(props) {
        const displayNotice = () => {
            Vue.notify({
                group: props.alertPosition,
                type: props.alertType,
                title: props.title,
                text: props.contents,
                duration: 2000,
                speed: 1000,
            });
        };
        return {
            displayNotice,
        };
    },
});
