import type { Meta, StoryObj } from '@storybook/vue';
import * as fontSize from 'mirinae-foundation/font-size.cjs';

import { getTypographyParameters } from '@/foundation/typography/stroy-helper';

const { semanticFontSize, lineHeight, letterSpacing } = fontSize;



const meta : Meta = {
    title: 'Foundation/Styles/Typography',
    parameters: {
        ...getTypographyParameters(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FontWeight: Story = {
    render: () => ({
        template: `
            <table style="border-collapse: separate; border-spacing: 16px; text-align: left;">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Font Weight</th>
                        <th>Example</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>font-bold</td>
                        <td>700</td>
                        <td class="font-bold">ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678910</td>
                    </tr>
                    <tr>
                        <td>font-semi-bold</td>
                        <td>600</td>
                        <td class="font-bold">ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678910</td>
                    </tr>
                    <tr>
                        <td>font-medium</td>
                        <td>500</td>
                        <td class="font-medium">ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678910</td>
                    </tr>
                    <tr>
                        <td>font-normal</td>
                        <td>400</td>
                        <td class="font-normal">ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678910</td>
                    </tr>
                </tbody>
            </table>
        `,
    }),
};

export const FontSize: Story = {
    render: () => ({
        template: `
            <table style="width: 100%; overflow: auto; border-collapse: separate; border-spacing: 20px; text-align: left;">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style="width: 100px;">Size</th>
                        <th>Line Height</th>
                        <th>Letter Spacing</th>
                        <th>Example</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for=" (fontSize, name) in fontSizesObj">
                        <td>text-{{name}}</td>
                        <td>{{fontSize[0]}}</td>
                        <td>{{fontSize[1].lineHeight}}</td>
                        <td>{{fontSize[1].letterSpacing}}</td>
                        <td :class="'text-'+ name">{{name}}</td>
                    </tr>
                </tbody>
            </table>
        `,
        setup() {
            return {
                fontSizesObj: semanticFontSize,
            };
        },
    }),
};

export const LineHeight: Story = {
    render: () => ({
        template: `
            <table style="border-collapse: separate; border-spacing: 16px; text-align: left;">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Line Height</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(lineHeight, name) in lineHeightObj">
                        <td >tracking-{{name}}</td>
                        <td> {{lineHeight}}</td>
                    </tr>
                </tbody>
            </table>
        `,
        setup() {
            return {
                lineHeightObj: lineHeight,
            };
        },
    }),
};

export const LetterSpacing: Story = {
    render: () => ({
        template: `
            <table style="border-collapse: separate; border-spacing: 16px; text-align: left;">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Letter Spacing</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(letterSpacing, name) in letterSpacingObj">
                        <td >leading-{{name}}</td>
                        <td> {{letterSpacing}}</td>
                    </tr>
                </tbody>
            </table>
        `,
        setup() {
            return {
                letterSpacingObj: letterSpacing,
            };
        },
    }),
};
