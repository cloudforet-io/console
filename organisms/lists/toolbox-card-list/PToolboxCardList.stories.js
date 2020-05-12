import { withKnobs, object, text } from '@storybook/addon-knobs/vue';
import { ref, toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PToolboxCardList from '@/components/organisms/lists/toolbox-card-list/PToolboxCardList.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTag from '@/components/molecules/tags/Tag.vue';
import { tagList } from '@/components/molecules/tags/toolset';

export default {
    title: 'organisms/lists/ToolboxCardList',
    component: PToolboxCardList,
    decorators: [withKnobs],
};

const setup = (props, context) => {
    const filterTools = tagList(ref(['tag1', 'filtertag2']));
    const sortBy = ref('Name');

    const onPageChange = action('pageChange');
    const onSortChange = action('sortChange');


    return {
        filterTools,
        sortBy,
        onPageChange,
        onSortChange,
    };
};


export const defaultCase = () => ({
    components: {
        PToolboxCardList,
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
        title: {
            default: text('title', 'Toolbox Card List'),
        },
        sortMenu: {
            default: object('sortMenu', [
                { type: 'item', label: 'Name', name: 'Name' },
                { type: 'item', label: 'Recent', name: 'Recent' },
            ]),
        },
    },
    template: `
    <div>
        <p-toolbox-card-list
                    v-bind="$props"
                    :sort-by.sync="sortBy"
                    @pageChange="onPageChange"
                    @sortChange="onSortChange"
                />
    </div>
    `,
    setup(props, context) {
        return setup(props, context);
    },
});


export const cardItemSlot = () => ({
    components: {
        PToolboxCardList,
        PBadge,
        PCol,
        PRow,
        PButton,
        PI,
        PDropdownMenuBtn,
        PTag,
    },
    props: {
        // ...autoProps(PCardList),
        items: {
            default: object('items', [
                {
                    id: 'aaa',
                    name: 'Plugin1',
                    desc: 'plugin description ...',
                    tags: ['tag1', 'tag2', 'tag3333'],
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
        title: {
            default: text('title', 'Toolbox Card List'),
        },
        sortMenu: {
            default: object('sortMenu', [
                { type: 'item', label: 'Name', name: 'Name' },
                { type: 'item', label: 'Recent', name: 'Recent' },
            ]),
        },
    },
    template: `<div>
                <p-toolbox-card-list
                    v-bind="$props"
                    :sort-by.sync="sortBy"
                    @pageChange="onPageChange"
                    @sortChange="onSortChange"
                >   
                    <template #filters>
                        <p-tag v-for="(filter, idx) in filterTools.tags" :key="idx+filter"
                                        @delete="filterTools.deleteTag(idx)"
                        >
                            {{ filter }}
                        </p-tag>
                    </template>
                    <template #card-extra="{item}">
                        <p-row style="height: 100%;">
                            <p-col>
                                <template v-if="item.tags">
                                    <p-badge v-for="(tag, idx) in item.tags" :key="idx" style-type="gray100">
                                        {{tag}}
                                    </p-badge>
                                </template>
                            </p-col>
                            <p-col :flex-grow="0" align-self="flex-end">
                                <p-row>
                                    <p-dropdown-menu-btn :menu="[]"style="margin-right: 1.25rem;">Version Info.</p-dropdown-menu-btn>
                                    <p-button style-type="primary-dark" >
                                        <p-i name="ic_plus" color="transparent inherit"
                                                width="1rem" height="1rem"
                                        ></p-i>
                                        Create
                                    </p-button>
                                </p-row>
                            </p-col>
                        </p-row>
                    </template>
                </p-toolbox-card-list>
                <button @click="filterTools.addTag('newTag')">add new Filter</button>
            </div>`,
    setup(props, context) {
        return setup(props, context);
    },
});
