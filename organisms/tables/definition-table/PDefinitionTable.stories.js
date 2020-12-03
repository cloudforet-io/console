import {
    toRefs, reactive,
} from '@vue/composition-api';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';

export default {
    title: 'Data Display/Tables',
    component: PDefinitionTable,
    parameters: {
        info: {
            summary: '',
            components: { PDefinitionTable },
        },
        knobs: { escapeHTML: false },
    },
};

export const definitionTable = () => ({
    components: { PDefinitionTable },
    props: {
        fields: {
            default: object('fields', [
                { label: 'id', name: 'collector_id' },
                { label: 'name', name: 'name' },
                { label: 'provider', name: 'provider' },
            ]),
        },
        data: {
            default: object('data', {
                // eslint-disable-next-line camelcase
                collector_id: 'collector-6746d641c98b',
                name: 'collector name',
                provider: 'aws',
            }),
        },
        loading: {
            default: boolean('loading', false),
        },
        skeletonRows: {
            default: number('skeletonRows', 5),
        },
    },
    template: `
    <div style="width: 80vw; background-color: white;">
        <p-definition-table v-bind="$props"></p-definition-table>
    </div>`,
    setup(props, context) {
        const state = reactive({
        });

        return {
            ...toRefs(state),
        };
    },
});


export const slotCase = () => ({
    components: { PDefinitionTable, PIconTextButton, PLazyImg },
    props: {
        fields: {
            default: object('fields', [
                { label: 'id', name: 'collector_id' },
                { label: 'name', name: 'name' },
                { label: 'provider', name: 'provider' },
            ]),
        },
        data: {
            default: object('data', {
                // eslint-disable-next-line camelcase
                collector_id: 'collector-6746d641c98b',
                name: 'collector name',
                provider: 'aws',
                tags: {
                    icon: 'https://assets-console-spaceone-stg.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                },
            }),
        },
        loading: {
            default: boolean('loading', false),
        },
        skeletonRows: {
            default: number('skeletonRows', 5),
        },
    },
    template: `
        <div style="width: 80vw; background-color: white;">
            <div class="my-8">
                <p>Slots</p>
                'data-{field index}' : Slot for definition field.
                'data-{field.name}' : Slot for definition field. Use it only when all field names are distinct. Otherwise, it can cause unexpected error.<br>
                It's useful when field names are duplicated.
                * Don't use 'data-{field.name}' slot together. It can cause multiple definition field.<br>
                no-data : Slot for no data case.<br>
                copy : Slot for all copy button. It replaces all copy button. <br>
                'copy-{field index}' : Slot for field's copy button. <br>
                'copy-{field.name}' : Slot for field's copy button. Use it only when all field names are distinct. Otherwise, it can cause unexpected error.<br>
                <br>
                <br>
                <p>SlotScope</p>
                Except for 'no-data' slot, all slots provide slot props.<br>
                 - all Definition component's slot scope. <br>
                <div class="pl-4">
                    all Props(name, label, data, disableCopy, formatter)<br>
                    field: 'td' element that wrapping definition text.<br>
                    displayData: actual data. it's usually the same with 'data'. it's different only when 'formatter(data)' is different value with 'data'.<br>
                    showCopy: boolean value that indicates whether show copy or not. it's related the value of 'displayData', 'disableCopy', and field element's innerText.<br>
                    copy: function that invoked when copy button is clicked.<br>
                    isMouseOver: boolean value that indicates whether copy button is mouse over or out.<br>
                    onMouseOver: function that invoked when copy button is mouse over.<br>
                    onMouseOut: function that invoked when copy button is mouse out.<br>
                </div>
                 - index <br>
                 - items(merged fields with data)<br>
            </div>



            <p-definition-table v-bind="$props">
                <template #data-name>
                    <p-lazy-img :src="data.tags.icon" width="1rem" height="1rem" />
                    <span class="ml-2 leading-none">{{ data.name }}</span>
                </template>
                <template #data-test="{data}">
                    <p-icon-text-button class="bg-primary text-white" name="ic_alert" fill>
                        {{data}}
                    </p-icon-text-button>
                </template>
                <template #data-test2="item">
                    <pre>{{item}}</pre>
                </template>
            </p-definition-table>
        </div>
        `,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});

export const noData = () => ({
    components: { PDefinitionTable },
    props: {
        items: [],
    },
    template: `
    <div style="width: 80vw; background-color: white;">
        <p-definition-table v-bind="$props"></p-definition-table>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
