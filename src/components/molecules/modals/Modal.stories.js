import PModal from './Modal';
import { size_mapping } from './ModalMapping';
import { number, select } from '@storybook/addon-knobs/vue';
import { autoProps } from '../../../setup/storybook-util';
import faker from 'faker';

export default {
    title: 'molecules/modals',
    component: PModal,
    parameters: {
        info: {
            summary: '',
            components: { PModal }
        },
        knobs: {
            escapeHTML: false
        }
    }
};

const data = {
    visible: true
};

export const modal = () => ({
    components: { PModal },
    template: `
<p-modal
    ref="modal"
    v-model="visible" 
    :scrollable="scrollable" 
    :centered="centered"
    :size="size"
    >
    <p style="min-width: 300px;min-height: 200px;">{{lorem}}</p>
</p-modal>
`,
    data() {
        return {
            ...data
        };
    },
    props: {
        loremLength: {
            default: number('loremLength', 10, { range: true, min: 1, max: 80, step: 10 })
        },
        size: {
            default: select('size', [null, ...Object.keys(size_mapping)])
        },
        ...autoProps(PModal, [
            { name: 'scrollable' },
            { name: 'centered' }
        ]),
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        }
    },
});


