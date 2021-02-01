import Vue from 'vue';
import { text, select, withKnobs } from '@storybook/addon-knobs';
import PToastAlert from '@/feedbacks/alert/toast/PToastAlert.vue';

export default {
    title: 'Feedbacks/Alert/Toast',
    component: PToastAlert,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5921%3A164027',
        },
    },
};

export const toastAlert = () => ({
    components: { PToastAlert },
    template: `
        <div>
            <div>
                <p-toast-alert group="toastTopCenter" position="top center" />
            </div>
            <div>
                <button @click="displayNotice">Launch Toast Alert</button>
            </div>
        </div>`,
    props: {
        title: {
            default: text('title', 'This is Title.'),
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
                group: 'toastTopCenter',
                type: props.alertType,
                title: props.title,
                text: props.contents,
                duration: 200000,
                speed: 1000,
                // closeOnClick: false,
            });
        };
        return {
            displayNotice,
        };
    },
});
