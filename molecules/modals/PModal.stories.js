import { number, select } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { sizeMapping } from '@/components/molecules/modals/PModal.toolset';
import PModal from '@/components/molecules/modals/PModal.vue';

export default {
    title: 'molecules/modals',
    component: PModal,
    parameters: {
        info: {
            summary: '',
            components: { PModal },
        },
        knobs: { escapeHTML: false },
        centered: { disable: true },
    },
};

const data = {
    visible: false,
};

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
};

export const modal = () => ({
    components: { PModal },
    template: `
<div>
<button @click="showAction">모달 열기</button>
<p-modal
    ref="modal"
    :centered="centered"
    :size="size"
    :fade="fade"
    :visible.sync="visible"
    :backdrop="backdrop"
    >
    <p style="min-width: 300px;min-height: 200px;">{{lorem}}</p>
    <button @click="closeAction">모달 닫기</button>
</p-modal>
</div>

`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], 'sm'),
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
        showAction() {
            this.visible = true;
        },
        closeAction() {
            this.visible = false;
        },
        ...actions,
    },
});
