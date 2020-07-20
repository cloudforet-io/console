import { withKnobs, text } from '@storybook/addon-knobs/vue';
import PCardItem from '@/components/molecules/cards/PCardItem.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';

export default {
    title: 'molecules/cards/CardItem',
    component: PCardItem,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PCardItem },
    props: {
        icon: {
            default: text('icon', 'ic_collector_tags'),
        },
        title: {
            default: text('title', 'Title'),
        },
        contents: {
            default: text('contents', 'description contents'),
        },
    },
    template: '<p-card-item v-bind="$props"/>',
});

export const extraSlot = () => ({
    components: {
        PCardItem,
        PBadge,
        PCol,
        PRow,
    },
    props: {
        icon: {
            default: text('icon', 'ic_collector_tags'),
        },
        title: {
            default: text('title', 'Title'),
        },
        contents: {
            default: text('contents', 'description contents'),
        },
    },
    template: `<p-card-item v-bind="$props">
                    <template #extra>
                        <p-row style="height: 100%;">
                            <p-col>
                                <p-badge style-type="gray100">tag1</p-badge>
                                <p-badge style-type="gray100">tag2</p-badge>
                                <p-badge style-type="gray100">tag3</p-badge>
                            </p-col>
                            <p-col :flex-grow="0" align-self="flex-end">
                                <p-badge style-type="primary">button1</p-badge>
                                <p-badge style-type="primary">button2</p-badge>
                            </p-col>
                        </p-row>
                    </template>
                </p-card-item>`,
});
