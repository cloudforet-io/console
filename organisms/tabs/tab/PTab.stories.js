import { action } from '@storybook/addon-actions';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';

export default {
    title: 'Navigation/Tabs',
    component: PTab,
    parameters: {
        info: {
            summary: '',
            components: { PTab },
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
        { name: 'tags', label: '태그' },
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
            <p>{{activeTab}}</p>
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
                { name: 'detail', label: '디테일' },
            ],
            activeTab: 'detail',
            ...actions,
        };
    },
});
