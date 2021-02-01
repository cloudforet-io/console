import PCheckBox from '@/inputs/checkbox/PCheckBox.vue';

export default {
    title: 'Inputs/Checkbox',
    component: PCheckBox,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A162064',
        },
    },
};
const actions = {};

export const checkbox = () => ({
    components: { PCheckBox },
    template: `
        <div>
            <div>
                <PCheckBox v-model="selectIndex" value=0>default</PCheckBox>
                <PCheckBox v-model="selectIndex" value=1 invalid>invalid</PCheckBox>
                <PCheckBox v-model="selectIndex" value=3 disabled>disabled</PCheckBox>
            </div>
            selected index : {{selectIndex}}
        </div>
    `,
    setup() {
        return {
            selectIndex: [],
            ...actions,
        };
    },
});
