import PCheckBox from '@/components/molecules/forms/checkbox/PCheckBox.vue';

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


export const multiCase = () => ({
    components: { PCheckBox },
    template: `
        <div>
            <div v-for="index in [1,2,3]" :key="index">
              <PCheckBox v-model="selectIndex" :value="index"></PCheckBox> {{index}}
            </div>
            selectIndex 타입이 Array일 경우 다중 선택 인덱스가 출력 됩니다 
            <br>{{selectIndex}}
        </div>
    `,
    setup() {
        return {
            selectIndex: [],
            ...actions,
        };
    },
});

export const checkbox = () => ({
    components: { PCheckBox },
    template: `
        <div>
            <PCheckBox v-model="selectIndex" ></PCheckBox> single select
            <p>
              selectIndex 타입이 Boolean일 경우 하나의 체크박스에 대한 결과를 알수 있습니다.  
            </p>
            <br>{{selectIndex}}
        </div>
    `,
    setup() {
        return {
            selectIndex: false,
            ...actions,
        };
    },
});
