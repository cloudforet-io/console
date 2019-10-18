import { withKnobs, boolean } from '@storybook/addon-knobs/vue';
import BaseModal from './BAMO_001_BaseModal';
import { action } from '@storybook/addon-actions';
import { autoProps } from '../../../setup/storybook_util';
import { i18n } from '../../../setup/i18n';

export default {
    title: 'base/Modal',
    component: BaseModal,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { BaseModal }
        }
    }
};
const actions = {
    ok: action('ok'),
    cancel: action('cancel'),
    esc: action('esc')
};
let data = {};

export const base = () => ({
    components: { BaseModal },
    template: `
<BaseModal ref="modal" @ok="ok" @cancel="cancel" @esc="esc">
    <template v-slot:activator>
        <button>모달 확인</button>
    </template>
    <template v-slot:contents>
        <p>this is modal</p>
    </template> 
</BaseModal>
`,
    i18n,
    mounted(){
        this.$refs.modal.showModal();
    },
    data() {
        return {
            ...data
        };
    },
    props: {
        ...autoProps(BaseModal),
        onModal: {
            default: boolean('modal', true)
        }
    },
    methods: {
        ...actions
    }
});

export const okOnly = () => ({
    components: { BaseModal },
    template: `
<BaseModal ref="modal" @ok="ok" @cancel="cancel" @esc="esc">
    <template v-slot:activator>
        <button>모달 확인</button>
    </template>
    <template v-slot:contents>
        <p>this is modal</p>
    </template> 
</BaseModal>
`,
    i18n,
    mounted(){
        this.$refs.modal.showModal();
    },
    data() {
        return {
            ...data
        };
    },
    props: {
        ...autoProps(BaseModal),
        onModal: {
            default: boolean('modal', true)
        }
    },
    methods: {
        ...actions
    }
});
