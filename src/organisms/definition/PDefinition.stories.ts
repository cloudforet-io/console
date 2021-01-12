import {
    toRefs, reactive,
} from '@vue/composition-api';
import { getKnobProps } from '@/util/storybook-util';
import PDefinition from '@/organisms/definition/PDefinition.vue';

export default {
    title: 'Others/Definition, Label, Item/Definition',
    component: PDefinition,
    parameters: {
        info: {
            summary: '',
            components: { PDefinition },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PDefinition },
    props: getKnobProps({
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            default: '',
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        options: {
            type: Object,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            default: () => ({}),
        },
        type: {
            type: String,
            default: 'text',
        },
    }, {
        name: 'name',
        data: 'data',
    }),
    template: `
        <div class="my-8">
            <p>Slots</p>
            default : Slot for replacing definition text. <br>
            copy: Slot for replacing copy button. <br>
            <br>
            <br>
            <p>SlotScope(Props)</p>
            all Props(name, label, data, disableCopy, formatter)<br>
            field: 'td' element that wrapping definition text.<br>
            displayData: actual data. it's usually the same with 'data'. it's different only when 'formatter(data)' is different value with 'data'.<br> 
            showCopy: boolean value that indicates whether show copy or not. it's related the value of 'displayData', 'disableCopy', and field element's innerText.<br>  
            copy: function that invoked when copy button is clicked.<br>
            isMouseOver: boolean value that indicates whether copy button is mouse over or out.<br>
            onMouseOver: function that invoked when copy button is mouse over.<br>
            onMouseOut: function that invoked when copy button is mouse out.<br>
            
            
        </div>
        <div style="width: 80vw;">
            <PDefinition v-bind="$props"></PDefinition>
        </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
