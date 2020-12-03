import { action } from '@storybook/addon-actions';
import { reactive, toRefs } from '@vue/composition-api';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/PSelectBtnGroup.vue';

export default {
    title: 'Inputs/Buttons',
    component: PSelectBtnGroup,
    parameters: {
        info: {
            summary: '',
            components: { PSelectBtnGroup },
        },
    },
};

export const seletButtonGroup = () => ({
    components: { PSelectBtnGroup },
    template: `
<div style="width: 50vw">
    <PSelectBtnGroup 
        :buttons="btns" 
        :selected.sync="selected"
        @clickButton="clickButton"
        @click-one="clickOne"
        @click-two="clickTwo"
        @click-three="clickThree"
        @click-four="clickFour"
        ></PSelectBtnGroup>
    <p>select btn : {{selected}}</p>
</div>`,
    setup() {
        const state = reactive({
            btns: [
                {
                    name: 'one',
                    label: '첫번째',
                    styleType: 'primary',
                    outline: true,
                },
                {
                    name: 'two',
                    label: '두번째',
                    styleType: 'primary',
                    outline: true,
                },
                {
                    name: 'three',
                    label: '세번째',
                    styleType: 'primary',
                    outline: true,
                },
                {
                    name: 'four',
                    label: '네번째',
                    styleType: 'primary',
                    outline: true,
                    disabled: true,
                },
            ],
            selected: 'one',
        });
        return {
            ...toRefs(state),
            clickButton: action('clickButton'),
            clickOne: action('click-one'),
            clickTwo: action('click-two'),
            clickThree: action('click-three'),
            clickFour: action('click-four'),
        };
    },
});

const actions = {
    clickButton: action('clickButton'),
    clickIP: action('click-ip'),
    clickCIDR: action('click-cidr'),
    clickMAC: action('click-mac'),
    clickNETWORK: action('click-network'),
    clickPROJ: action('click-project'),
    clickREGION: action('click-region'),
};
export const withTrHelper = () => ({
    components: { PSelectBtnGroup },
    template: `
<div style="width: 50vw">
    <PSelectBtnGroup
        :buttons="btns"
        :selected.sync="selected"
        @clickButton="clickButton"
        @click-ip="clickIP"
        @click-cidr="clickCIDR"
        @click-mac="clickMAC"
        @click-network="clickNETWORK"
        @click-project="clickPROJ"
        @click-region="clickREGION"
        ></PSelectBtnGroup>
    <p>select btn : {{selected}}</p>
</div>`,
    setup(_, { parent }) {
        const state = reactive({
            btns: [
                {
                    name: 'ip', label: 'IP', styleType: 'primary', outline: true,
                },
                {
                    name: 'cidr', label: 'CIDR', styleType: 'primary', outline: true,
                },
                {
                    name: 'mac', label: 'MAC', styleType: 'primary', outline: true,
                },
                {
                    name: 'network', label: 'NETWORK', styleType: 'primary', outline: true,
                },
                {
                    name: 'project', label: 'PROJECT', styleType: 'primary', outline: true,
                },
                {
                    name: 'region', label: 'REGION', disabled: true, styleType: 'primary', outline: true,
                },
            ],
            selected: 'ip',
        });
        return {
            ...toRefs(state),
            ...actions,
        };
    },
});

export const scroll = () => ({
    components: { PSelectBtnGroup },
    template: `
<div style="width: 30vw">
    <PSelectBtnGroup
        :buttons="btns"
        :selected.sync="selected"
        @clickButton="clickButton"
        @click-ip="clickIP"
        @click-cidr="clickCIDR"
        @click-mac="clickMAC"
        @click-network="clickNETWORK"
        @click-project="clickPROJ"
        @click-region="clickREGION"
        ></PSelectBtnGroup>
    <p>select btn : {{selected}}</p>
</div>`,
    setup(_, { parent }) {
        const state = reactive({
            btns: [
                {
                    name: 'ip', label: 'IP', styleType: 'primary', outline: true,
                },
                {
                    name: 'cidr', label: 'CIDR', styleType: 'primary', outline: true,
                },
                {
                    name: 'mac', label: 'MAC', styleType: 'primary', outline: true,
                },
                {
                    name: 'network', label: 'NETWORK', styleType: 'primary', outline: true,
                },
                {
                    name: 'project', label: 'PROJECT', styleType: 'primary', outline: true,
                },
                {
                    name: 'region', label: 'REGION', disabled: true, styleType: 'primary', outline: true,
                },
            ],
            selected: 'ip',
        });
        return {
            ...toRefs(state),
            ...actions,
        };
    },
});
