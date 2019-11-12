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
                {
                    title: 'ID',
                    contents: {
                        text: 'Fire Birds',
                        link: 'www.google.com',
                    },
                    copyFlag: true,
                },
                {
                    title: 'Name',
                    contents: {
                        text: 'Shawn Mandus',
                    },
                },
                {
                    title: 'Created',
                    contents: {
                        text: '2019-09-08 23:11:23',
                    },
                    copyFlag: true,
                },
            ],
        };
    },
});
