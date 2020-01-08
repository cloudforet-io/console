import { action } from '@storybook/addon-actions';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';

export default {
    title: 'organisms/panel/DictPanel',
    component: PDictPanel,
    parameters: {
        info: {
            summary: '',
            components: { PDictPanel },
        },
    },
};
const actions = {
    confirm: action('confirm'),
};
export const defaultCase = () => ({
    components: { PDictPanel },
    template: `
<div style="width: 80vw;">
    <p-dict-panel ref="dictPanel" :dict.sync="dict" @confirm="confirm"></p-dict-panel>
    <p>confirm 이후 태그 변경 API요청 실패시 원복하기</p>
    <button @click="reset">복구하기</button>
</div>`,
    data() {
        return {
            dict: {
                as: 'df',
                cf: 'adf',
                df: 'adf',
            },
        };
    },
    methods: {
        ...actions,
        reset() {
            this.$refs.dictPanel.reset();
        },
    },
});
