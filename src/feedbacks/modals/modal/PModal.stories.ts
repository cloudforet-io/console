import {
    number, select, boolean, withKnobs,
} from '@storybook/addon-knobs';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import { sizeMapping } from '@/feedbacks/modals/modal/type';
import PModal from '@/feedbacks/modals/modal/PModal.vue';
import { computed, ref } from '@vue/composition-api';

export default {
    title: 'Feedbacks/Modals/Deprecated/Modal',
    component: PModal,
    decorators: [withKnobs],
    parameters: {
        centered: { disable: true },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A191090',
        },
    },
};

const sizes = Object.keys(sizeMapping);

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
};

export const modal = () => ({
    components: { PModal },
    template: `
        <div>
            <button @click="showAction">Open Modal</button>
            <p-modal
                ref="modal"
                :centered="centered"
                :size="size"
                :fade="fade"
                :visible.sync="visible"
                :backdrop="backdrop"
                >
                <p style="min-width: 300px;min-height: 200px;">{{lorem}}</p>
                <button @click="closeAction">Close Modal</button>
            </p-modal>
        </div>`,
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
            default: select('size', ['', ...sizes], 'sm'),
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
    setup(props) {
        const visible = ref(false);
        const lorem = computed(() => faker.lorem.lines(props.loremLength));
        const showAction = () => {
            visible.value = true;
        };
        const closeAction = () => {
            visible.value = false;
        };
        return {
            visible,
            lorem,
            showAction,
            closeAction,
            ...actions,
        };
    },
});
