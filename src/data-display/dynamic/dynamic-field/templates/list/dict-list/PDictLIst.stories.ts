import { withKnobs, object } from '@storybook/addon-knobs';
import PDictList from '@/data-display/dynamic/dynamic-field/templates/list/dict-list/PDictList.vue';


export default {
    title: 'Data Display/Lists/Dict List',
    component: PDictList,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PDictList },
    props: {
        dict: {
            default: object('tags', {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
            }),
        },
    },
    template: '<p-dict-list v-bind="$props"/>',
});
