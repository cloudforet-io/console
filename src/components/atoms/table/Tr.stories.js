import Tr from '@/components/atoms/table/Tr.vue';
import { autoProps } from '../../../setup/storybook-util';

export default {
    title: 'atoms/table/tr',
    component: Tr,
    parameters: {
        info: {
            summary: '',
            components: { Tr },
        },
    },
};
export const tr = () => ({
    components: { Tr },
    template: '<p-tr :styleType="styleType" :background="background" ></p-tr>',
    props: {
        ...autoProps(Tr),
    },
});
