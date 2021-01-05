import PCheckBox from '@/molecules/forms/checkbox/PCheckBox.vue';

export default {
    title: 'Inputs/Checkbox',
    component: PCheckBox,
    parameters: {
        info: {
            summary: '',
            components: { PCheckBox },
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
