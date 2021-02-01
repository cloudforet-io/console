import { action } from '@storybook/addon-actions';
import PTabBar from '@/navigation/tabs/tab/tab-bar/PTabBar.vue';

export default {
    title: 'Navigation/Tabs/Tab Bar',
    component: PTabBar,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6013%3A121728',
        },
    },
};
const actions = {
    changeTab: action('changeTab'),
};
const data = {
    tabs: [
        { name: 'detail', label: '디테일' },
        { name: 'info', label: '정보' },
        { name: 'tags', label: '태그', beta: true },
    ],
    activeTab: 'detail',
};

export const tabBar = () => ({
    components: { PTabBar },
    template: `
        <div>
            <p-tab-bar 
                :tabs="tabs" 
                :activeTab.sync="activeTab"
                @changeTab="changeTab"
            />
            <p>{{activeTab}}</p>
            <input type="text" v-model="activeTab">
        </div>`,
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});
