import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getContextMenuItemArgs, getContextMenuItemParameters, getContextMenuItemArgTypes } from '@/inputs/context-menu/context-menu-item/story-helper';

import PContextMenuItem from './PContextMenuItem.vue';

type PContextMenuItemPropsAndCustomArgs = ComponentProps<typeof PContextMenuItem>;

const meta : Meta<PContextMenuItemPropsAndCustomArgs> = {
    title: 'Inputs/Context Menu Item',
    component: PContextMenuItem,
    argTypes: {
        ...getContextMenuItemArgTypes(),
    },
    parameters: {
        ...getContextMenuItemParameters(),
    },
    args: {
        ...getContextMenuItemArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PContextMenuItem>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PContextMenuItem },
        template: `
            <PContextMenuItem
                :name="name"
                :label="label"
                :link="link"
                :to="to"
                :disabled="disabled"
                :selected="selected"
                :select-marker="selectMarker"
                :ellipsis="ellipsis"
                :highlightTerm="highlightTerm"
                :image-url="imageUrl"
                :icon="icon"
                :icon-color="iconColor"
                @click.stop="onClick"
            ></PContextMenuItem>
        `,
        setup() {
            return {
                onClick() {
                    console.debug('click!');
                },
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PContextMenuItem },
        template: `
            <div class="border border-primary-1 p-4">
                <p-context-menu-item label="basic (mouse over me to check hover style)" />
                <p-context-menu-item label="disabled" disabled />
                <p-context-menu-item label="selected" selected />
                <p-context-menu-item label="long long long long long long long long long long long long long long long long 
                long long long long long long long long long long long long long long long long long long long long label case" />
                <p-context-menu-item label="ellipsis, long long long long long long long long long long long long long long 
                long long long long long long long long long long long long long long long long long long long long long long label case" ellipsis />
            </div>
        `,
    }),
};

export const AnchorCase: Story = {
    render: () => ({
        components: { PContextMenuItem },
        template: `
            <div class="border border-primary-1 p-4">
                <p-context-menu-item label="to (style is the same with the basic case)" :to="{}" />
                <p-context-menu-item label="link" link="http://google.com" />
                <p-context-menu-item label="link, disabled" link="http://google.com" disabled />
                <p-context-menu-item label="link, selected" link="http://google.com" selected />
                <p-context-menu-item label="link, long long long long long long long long long long long long long long long 
                long long long long long long long long long long long long long long long long long long long long long label case" link="http://google.com" />
                <p-context-menu-item label="link, ellipsis, long long long long long long long long long long long long long 
                long long long long long long long long long long long long long long long long long long long long long long long label case" link="http://google.com" ellipsis />
            </div>
        `,
    }),
};

export const ImageIconCase: Story = {
    render: () => ({
        components: { PContextMenuItem },
        template: `
            <div>
                <h2>Image Case</h2>
                <div class="border border-primary-1 p-4">
                    <p-context-menu-item image-url="ic_refresh" label="to (style is the same with the basic case)" />
                    <p-context-menu-item image-url="ic_refresh" label="link" />
                    <p-context-menu-item image-url="ic_refresh" label="link, disabled" disabled />
                    <p-context-menu-item image-url="ic_refresh" label="link, selected" selected />
                    <p-context-menu-item image-url="ic_refresh" label="link, long long long long long long long long long long 
                    long long long long long long long long long long long long long long long long long long long long long long long long long long label case" />
                    <p-context-menu-item image-url="ic_refresh" label="link, ellipsis, long long long long long long long long 
                    long long long long long long long long long long long long long long long long long long long long long long long long long long long long label case" ellipsis />
                    <p-context-menu-item image-url="ic_refresh" label="link, ellipsis, long long long long long long long long 
                    long long long long long long long long long long long long long long long long long long long long long long long long long long long long label case" select-marker="radio" />
                </div>
                <br/>
                <h2>Icon Case</h2>
                <div class="border border-primary-1 p-4">
                    <p-context-menu-item icon="ic_refresh" label="to (style is the same with the basic case)" />
                    <p-context-menu-item icon="ic_refresh" label="link" />
                    <p-context-menu-item icon="ic_refresh" label="link, disabled" disabled />
                    <p-context-menu-item icon="ic_refresh" label="link, selected" selected />
                    <p-context-menu-item icon="ic_refresh" label="link, long long long long long long long long long long long 
                    long long long long long long long long long long long long long long long long long long long long long long long long long label case" />
                    <p-context-menu-item icon="ic_refresh" label="link, ellipsis, long long long long long long long long long 
                    long long long long long long long long long long long long long long long long long long long long long long long long long long long label case" ellipsis />
                    <p-context-menu-item icon="ic_refresh" label="link, ellipsis, long long long long long long long long long 
                    long long long long long long long long long long long long long long long long long long long long long long long long long long long label case" select-marker="radio" />
                </div>
                <br/>
                <p><b>In cases where icons and images are used at the same time, the icons are shown preferentially.</b></p>
            </div>
        `,
    }),
};

export const SelectMarkers: Story = {
    render: () => ({
        components: { PContextMenuItem },
        template: `
            <div class="border border-primary-1 p-4">
                <p-context-menu-item label="selectMarker: checkbox" select-marker="checkbox" />
                <p-context-menu-item label="selectMarker: checkbox, link" select-marker="checkbox" link="https://google.com" />
                <p-context-menu-item label="selectMarker: checkbox, long long long long long long long long long long long long 
                long long long long long long long long long long long long long long long long long long long
                 long long long long long label case" select-marker="checkbox" />
                <p-context-menu-item label="selectMarker: checkbox, link, long long long long long long long long long long long 
                long long long long long long long long long long long long long long long long long 
                long long long long long long long long label case" select-marker="checkbox" link="https://google.com" />
                <p-context-menu-item label="selectMarker: checkbox, link, ellipsis, long long long long long long long long long 
                long long long long long long long long long long long long long long long long long long long 
                long long long long long long long long label case" select-marker="checkbox" link="https://google.com" ellipsis />
                <p-context-menu-item label="selectMarker: checkbox, selected" select-marker="checkbox" selected />
                <p-context-menu-item label="selectMarker: checkbox, disabled" select-marker="checkbox" disabled />
                <p-context-menu-item label="selectMarker: checkbox, selected, disabled" select-marker="checkbox" selected disabled />
                <p-context-menu-item label="selectMarker: radio" select-marker="radio" />
                <p-context-menu-item label="selectMarker: radio, disabled" select-marker="radio" disabled />
                <p-context-menu-item label="selectMarker: radio, selected" select-marker="radio" selected />
                <p-context-menu-item label="selectMarker: radio, selected, disabled" select-marker="radio" selected disabled />
            </div>
        `,
    }),
};

export const HighlightTerm: Story = {
    render: () => ({
        components: { PContextMenuItem },
        template: `
            <div class="border border-primary-1 p-4">
                <p-context-menu-item label="This is the context menu item with highlight 
                term 'highlight'. This uses Text Highlighting component internally." highlight-term="highlight" />
                <p-context-menu-item label="This is the context menu item with highlight 
                term 'highlight' and with the link. This uses Text Highlighting component internally." highlight-term="highlight" link="https://google.com" />
                <p-context-menu-item label="This is the context menu item with highlight 
                term 'highlight' and with the selected checkbox. This uses Text Highlighting component internally." highlight-term="highlight" select-marker="checkbox" selected />
                <p-context-menu-item label="This is the disabled context menu item with highlight 
                term 'highlight'. This uses Text Highlighting component internally." highlight-term="highlight" disabled />
            </div>
        `,
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PContextMenuItem },
        template: `
            <div>
                <p-context-menu-item>
                    <span class="text-xl font-bold text-primary-dark">default slot.</span>
                </p-context-menu-item>
                <p-context-menu-item link="https://google.com">
                    <span class="text-xl font-bold text-primary-dark">default slot with link</span>
                </p-context-menu-item>
                <p-context-menu-item link="https://google.com" select-marker="checkbox">
                    <span class="text-xl font-bold text-primary-dark">default slot with link, select marker</span>
                </p-context-menu-item>
                <p-context-menu-item label="This is the text-list slot with highlight term." highlight-term="text-list">
                    <template #text-list="{text, matched}">
                        <span class="text-xl font-bold text-primary-dark" :class="{'text-red': matched}">{{text}}</span>
                    </template>
                </p-context-menu-item>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
