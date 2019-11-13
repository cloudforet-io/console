import { action } from '@storybook/addon-actions';
import PTagPanel from '@/components/organisms/panels/tag-panel/TagPanel';

export default {
    title: 'organisms/panel/tag-panel',
    component: PTagPanel,
    parameters: {
        info: {
            summary: '',
            components: { PTagPanel },
        },
    },
};
const actions = {
    confirm: action('confirm'),
};
export const panelContents = () => ({
    components: { PTagPanel },
    template: `
<div style="width: 80vw;">
    <PTagPanel ref="tagPanel" :tags.sync="tags" @confirm="confirm"></PTagPanel>
    <p>confirm 이후 태그 변경 API요청 실패시 원복하기</p>
    <button @click="resetTag">복구하기</button>
</div>`,
    data() {
        return {
            tags: {
                as: 'df',
                cf: 'adf',
                df: 'adf',
            },
        };
    },
    methods: {
        ...actions,
        resetTag() {
            this.$refs.tagPanel.resetTag();
        },
    },
});
