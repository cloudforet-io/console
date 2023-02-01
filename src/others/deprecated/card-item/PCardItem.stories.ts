import { withKnobs, text } from '@storybook/addon-knobs';

import PBadge from '@/data-display/badge/PBadge.vue';
import PCardItem from '@/others/deprecated/card-item/PCardItem.vue';

export default {
    title: 'Others/Deprecated/Card Item',
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
    template: `
<p-card-item v-bind="$props">
    <template #extra>
        <div>
            <p-badge style-type="gray100">tag1</p-badge>
            <p-badge style-type="gray100">tag2</p-badge>
            <p-badge style-type="gray100">tag3</p-badge>
            <p-badge style-type="primary">button1</p-badge>
            <p-badge style-type="primary">button2</p-badge>
        </div>
    </template>
</p-card-item>`,
});
