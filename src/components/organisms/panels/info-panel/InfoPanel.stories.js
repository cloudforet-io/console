import faker from 'faker';
import InfoPanel from './InfoPanel.vue';
import { autoProps } from '../../../../setup/storybook-util';

export default {
    title: 'organisms/panel/info-panel',
    component: InfoPanel,
    parameters: {
        info: {
            summary: '',
            components: { InfoPanel },
        },
    },
};
export const panelContents = () => ({
    components: { InfoPanel },
    template: '<div style="width: 80vw;"><InfoPanel :infoTitle="renderTitle" :contentData="renderData"></InfoPanel></div>',
    props: {
        ...autoProps(InfoPanel),
    },
    data() {
        return {
            renderTitle: 'Information',
            renderData: [
                { header: 'ID', content: 'Fire Birds' },
                { header: 'Name', content: 'Paul Phoenix' },
                { header: 'Created', content: '2019-09-11 21:11:22' },
            ],
        };
    },
});
