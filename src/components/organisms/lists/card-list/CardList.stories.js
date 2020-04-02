import { withKnobs, text, object } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import PCardList from './CardList';
import PBadge from '@/components/atoms/badges/Badge';
import PCol from '@/components/atoms/grid/col/Col';
import PRow from '@/components/atoms/grid/row/Row';

export default {
    title: 'organisms/lists/CardList',
    component: PCardList,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PCardList },
    props: {
        // ...autoProps(PCardList),
        items: {
            default: object('items', [
                {
                    id: 'aaa',
                    name: 'Plugin1',
                    desc: 'plugin description ...',
                },
                {
                    id: 'bbb',
                    name: 'Plugin2',
                    desc: 'plugin description ...',
                    icon: 'aws-ec2',
                },
                {
                    id: 'ccc',
                    name: 'Plugin3',
                    desc: 'plugin description ...',
                },
            ]),
        },
        mapper: {
            default: object('mapper', {
                key: 'id',
                icon: 'icon',
                title: 'name',
                contents: 'desc',
            }),
        },
    },
    template: '<PCardList v-bind="$props"/>',
});


export const extraSlot = () => ({
    components: {
        PCardList,
        PBadge,
        PCol,
        PRow,
    },
    props: {
        // ...autoProps(PCardList),
        items: {
            default: object('items', [
                {
                    id: 'aaa',
                    name: 'Plugin1',
                    desc: 'plugin description ...',
                },
                {
                    id: 'bbb',
                    name: 'Plugin2',
                    desc: 'plugin description ...',
                    icon: 'aws-ec2',
                },
                {
                    id: 'ccc',
                    name: 'Plugin3',
                    desc: 'plugin description ...',
                },
            ]),
        },
        mapper: {
            default: object('mapper', {
                key: 'id',
                icon: 'icon',
                title: 'name',
                contents: 'desc',
            }),
        },
    },
    template: `<PCardList v-bind="$props">
                <template #extra>
                    <p-row style="height: 100%;">
                        <p-col>
                            <p-badge style-type="gray100">
                                tag1
                            </p-badge>
                            <p-badge style-type="gray100">
                                tag2
                            </p-badge>
                            <p-badge style-type="gray100">
                                tag3
                            </p-badge>
                        </p-col>
                        <p-col :flex-grow="0" align-self="flex-end">
                            <p-badge style-type="primary">
                                button1
                            </p-badge>
                            <p-badge style-type="primary">
                                button2
                            </p-badge>
                        </p-col>
                    </p-row>
                </template>
              </PCardList>`,
});
