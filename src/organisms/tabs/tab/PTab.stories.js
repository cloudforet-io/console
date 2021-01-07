import { action } from '@storybook/addon-actions';
import PTab from '@/organisms/tabs/tab/PTab.vue';

export default {
    title: 'Navigation/Tabs',
    component: PTab,
    parameters: {
        info: {
            summary: '',
            components: { PTab },
        },
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
        { name: 'detail', label: 'Detail' },
        { name: 'info', label: 'Info' },
        { name: 'tags', label: 'Tags' },
    ],
    activeTab: 'detail',
};


export const tab = () => ({
    components: { PTab },
    template: `
        <div style="width: 80vw;">
            <PTab :tabs="tabs" :activeTab.sync="activeTab" >
            <template #detail="{tabName}" >
                <keep-alive>
                   <p> this tab is {{tabName}}</p> 
                </keep-alive>  
            </template>
            <template #info="{tabName}" >
                   <p> this tab is {{tabName}}</p> 
            </template>
            <template #tags="{tabName}" >
                   <p> this tab is {{tabName}}</p> 
            </template>
        
            </PTab>
        </div>`,
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});

export const oneTab = () => ({
    components: { PTab },
    template: `
        <div style="width: 80vw;">
            <PTab :tabs="tabs" :activeTab.sync="activeTab" >
            <template #detail="{tabName}" >
                <keep-alive>
                   <p> this tab is {{tabName}}</p>
                </keep-alive>
            </template>
            <template #info="{tabName}" >
                   <p> this tab is {{tabName}}</p>
            </template>
            <template #tags="{tabName}" >
                   <p> this tab is {{tabName}}</p>
            </template>
        
            </PTab>
        </div>`,
    setup() {
        return {
            tabs: [
                { name: 'detail', label: 'Detail' },
            ],
            activeTab: 'detail',
            ...actions,
        };
    },
});

export const twoTabs = () => ({
    components: { PTab },
    template: `
        <div style="width: 80vw;">
            <PTab :tabs="tabs" :activeTab.sync="activeTab" >
            <template #detail="{tabName}" >
                <keep-alive>
                   <p> this tab is {{tabName}}</p>
                </keep-alive>
            </template>
            <template #info="{tabName}" >
                   <p> this tab is {{tabName}}</p>
            </template>
            <template #tags="{tabName}" >
                   <p> this tab is {{tabName}}</p>
            </template>
        
            </PTab>
        </div>`,
    setup() {
        return {
            tabs: [
                { name: 'detail', label: 'Detail' },
                { name: 'info', label: 'Info' },
            ],
            activeTab: 'detail',
            ...actions,
        };
    },
});
