import {
    toRefs, reactive,
} from '@vue/composition-api';
import { text, boolean, withKnobs } from '@storybook/addon-knobs';
import PDefinition from '@/data-display/tables/definition-table/definition/PDefinition.vue';

export default {
    title: 'Data Display/Tables/Definition Table',
    component: PDefinition,
    decorators: [withKnobs],
    parameters: {
        knobs: { escapeHTML: false },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5373%3A6989',
        },
    },
};


export const definitionItem = () => ({
    components: { PDefinition },
    props: {
        name: {
            default: text('name', 'name'),
        },
        label: {
            default: text('label', ''),
        },
        data: {
            default: text('data', 'data'),
        },
        disableCopy: {
            default: boolean('disableCopy', false),
        },
    },
    template: `
    <div style="width: 80vw;">
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
        <div class="bg-primary3">
            <p-definition v-bind="$props"></p-definition>
        </div>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
