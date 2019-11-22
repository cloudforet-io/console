import { toRefs, reactive } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PNoticeAlert from './NoticeAlert';
import { autoProps } from '@/setup/storybook-util';

export default {
    title: 'NoticeAlert',
    component: PNoticeAlert,
    parameters: {
        info: {
            summary: '',
            components: { PNoticeAlert },
        },
    },
};
const actions = {};
const data = {};
export const NoticeAlert = () => ({
    components: { PNoticeAlert },
    template: '<PNoticeAlert ></PNoticeAlert>',
    data() {
        return {
            ...data,
        };
    },
    props: {
        ...autoProps(PNoticeAlert),
    },
    methods: {
        ...actions,
    },
});
