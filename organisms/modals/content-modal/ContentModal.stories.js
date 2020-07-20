import { number, select } from '@storybook/addon-knobs/vue';
import { boolean } from '@storybook/addon-knobs';
import { autoProps } from '@sb/storybook-util';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { sizeMapping } from '@/components/molecules/modals/PModal.toolset';
import PContentModal from '@/components/organisms/modals/content-modal/ContentModal.vue';
import faker from 'faker';

export default {
    title: 'organisms/modals/content-modal',
    component: PContentModal,
    parameters: {
        info: {
            summary: '',
            components: { PContentModal },
        },
        centered: { disable: true },
    },
};


export const modal = () => ({
    components: { PContentModal, PButton },
    template: `<p-content-modal
                    ref="modal"
                    :scrollable="scrollable" 
                    :centered="centered"
                    :size="size"
                    :headerVisible="headerVisible"
                    :bodyVisible="bodyVisible"
                    :footerVisible="footerVisible"
                    :visible.sync="visible"
                    :themeColor="primary"
                >
                    <template #header>This is Header.</template>
                    <template #body>
                        <p>{{lorem}}</p> 
                    </template>  
                    <template #footer>this is Footer.</template>
                </p-content-modal>
            `,
    data() {
        return {
            visible: true,
        };
    },
    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },
        ...autoProps(PContentModal, [
            { name: 'headerVisible' },
            { name: 'bodyVisible' },
            { name: 'footerVisible' },
        ]),
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], 'sm'),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
        centered: {
            default: boolean('centered', false),
        },
        backdrop: {
            default: boolean('backdrop', true),
        },
        fade: {
            default: boolean('fade', true),
        },
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        },
    },
    methods: {
        click() {
            this.visible = true;
        },
    },
});

export const fade = () => ({
    components: { PContentModal, PButton },
    template: `<div>
                <p-button styleType="primary" @click="click">Launch a modal</p-button>
                <p-content-modal
                    ref="modal" 
                    :scrollable="scrollable" 
                    :centered="centered"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :headerVisible="headerVisible"
                    :bodyVisible="bodyVisible"
                    :footerVisible="footerVisible"
                    :visible.sync="visible"
                    >
                    <template #header>This is Header</template>
                    <template>
                        <p>{{lorem}}</p> 
                    </template>  
                    <template #footer><p-button styleType="danger" @click="close">닫기</p-button></template>
                </p-content-modal>
                </div>`,
    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },
        ...autoProps(PContentModal, [
            { name: 'headerVisible' },
            { name: 'bodyVisible' },
            { name: 'footerVisible' },
        ]),
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], 'sm'),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
        centered: {
            default: boolean('centered', false),
        },
        backdrop: {
            default: boolean('backdrop', true),
        },
        fade: {
            default: boolean('fade', true),
        },
    },
    data() {
        return {
            visible: false,
        };
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        },
    },
    methods: {
        click() {
            this.$refs.modal.show();
        },
        close() {
            this.$refs.modal.hide();
        },
    },
});
