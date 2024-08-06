import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getSearchArgs, getSearchParameters, getSearchArgTypes } from '@/inputs/search/search/story-helper';

import PSearch from './PSearch.vue';

type PSearchPropsAndCustomArgs = ComponentProps<typeof PSearch>;

const meta : Meta<PSearchPropsAndCustomArgs> = {
    title: 'Inputs/Search',
    component: PSearch,
    argTypes: {
        ...getSearchArgTypes(),
    },
    parameters: {
        ...getSearchParameters(),
    },
    args: {
        ...getSearchArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSearch>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSearch },
        template: `
            <p-search v-model="proxyValue"
                      v-bind="inputAttrs"
                      :placeholder="placeholder"
                      :disable-icon="disableIcon"
                      :invalid="invalid"
                      :disabled="disabled"
                      :is-focused="isFocused"
                      :visible-menu="visibleMenu"
                      :use-fixed-menu-style="useFixedMenuStyle"
                      :menu="menu"
                      :loading="loading"
                      :handler="handler"
                      :disable-handler="disableHandler"
                      :use-auto-complete="useAutoComplete"
                      @search="onSearch"
                      @focus="onFocus"
                      @blur="onBlur"
                      @input="onInput"
                      @delete="onDelete"
            >
            </p-search>
        `,
        setup(props) {
            const state = reactive({
                proxyValue: props.value,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PSearch },
        template: `
            <p-search v-model="proxyValue"/>
        `,
        setup(props) {
            const state = reactive({
                proxyValue: props.value,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const DisableHandler: Story = {
    render: () => ({
        components: { PSearch },
        template: `
            <div>
                <div>Search Text : {{ searchText }}</div>
                <br />
                <p-search v-model="proxyValue"
                    use-fixed-menu-style
                    use-auto-complete
                    :menu="menu"
                    disable-handler
                    @search="handleSearch"/>
            </div>
        `,
        setup(props) {
            const state = reactive({
                proxyValue: props.value,
                menu: [
                    { name: 1, label: 'menu1', type: 'item' },
                    { name: 2, label: 'menu2', type: 'item' },
                    { name: 3, label: 'menu3', type: 'item' },
                ],
                searchText: '',
            });
            const handleSearch = (val) => {
                state.searchText = val;
            };
            return {
                ...toRefs(state),
                handleSearch,
            };
        },
    }),
};

export const InjectedHandler: Story = {
    render: () => ({
        components: { PSearch },
        template: `
            <div>
                <div>Search Text : {{ searchText }}</div>
                <br />
                <p-search v-model="proxyValue"
                    use-fixed-menu-style
                    use-auto-complete
                    :handler="handlePromise"
                    @search="handleSearch"/>
            </div>
        `,
        setup(props) {
            const menu = [
                { name: 1, label: 'menu1', type: 'item' },
                { name: 2, label: 'menu2', type: 'item' },
                { name: 3, label: 'menu3', type: 'item' },
            ];
            const state = reactive({
                proxyValue: props.value,
                searchText: '',
            });
            const handleSearch = (val) => {
                state.searchText = val;
            };
            const promiseReturn = (searchText) => new Promise((resolve) => {
                setTimeout(() => {
                    resolve(menu.filter((item) => item.label.includes(searchText)));
                }, 1000);
            });
            const handlePromise = (searchText) => promiseReturn(searchText);
            return {
                ...toRefs(state),
                handleSearch,
                handlePromise,
            };
        },
    }),
};

export const DefaultHandler: Story = {
    render: () => ({
        components: { PSearch },
        template: `
            <div>
                <div>Search Text : {{ searchText }}</div>
                <br />
                <p-search v-model="proxyValue"
                    use-fixed-menu-style
                    use-auto-complete
                    :menu="menu"
                    @search="handleSearch"/>
            </div>
        `,
        setup(props) {
            const state = reactive({
                proxyValue: props.value,
                menu: [
                    { name: 1, label: 'menu1', type: 'item' },
                    { name: 2, label: 'menu2', type: 'item' },
                    { name: 3, label: 'menu3', type: 'item' },
                ],
                searchText: '',
            });
            const handleSearch = (val) => {
                state.searchText = val;
            };
            return {
                ...toRefs(state),
                handleSearch,
            };
        },
    }),
};

export const Invalid: Story = {
    render: () => ({
        components: { PSearch },
        template: `
            <p-search v-model="proxyValue" invalid/>
        `,
        setup(props) {
            const state = reactive({
                proxyValue: props.value,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Disabled: Story = {
    render: () => ({
        components: { PSearch },
        template: `
            <p-search v-model="proxyValue" disabled/>
        `,
        setup(props) {
            const state = reactive({
                proxyValue: props.value,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Readonly: Story = {
    render: () => ({
        components: { PSearch },
        template: `
            <p-search v-model="proxyValue" readonly />
        `,
        setup(props) {
            const state = reactive({
                proxyValue: props.value,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
