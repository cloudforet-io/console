import { withKnobs, boolean } from '@storybook/addon-knobs/vue';
import BaseModal from './BaseModal';
import { action } from '@storybook/addon-actions';
import { autoProps } from '@sb/storybook-util';
import { i18n } from '@/translations';

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
    mounted() {
        this.$refs.modal.showModal();
    },
    data() {
        return {
            ...data
        };
    },
    props: {
        ...autoProps(BaseModal)
    },
    methods: {
        ...actions
    }
});

export const okOnly = () => ({
    components: { BaseModal },
    template: `
<BaseModal ref="modal" @ok="ok" @cancel="cancel" @esc="esc" :title="title" :text="text" :okOnly="true">
    <template v-slot:activator>
        <button>모달 확인</button>
    </template>
    <template v-slot:contents>
        <p>this is modal</p>
    </template> 
</BaseModal>
`,
    i18n,
    mounted() {
        this.$refs.modal.showModal();
    },
    data() {
        return {
            ...data
        };
    },
    props: {
        ...autoProps(BaseModal, [
            { name: 'title' },
            { name: 'text' }
        ])
    },
    methods: {
        ...actions
    }
});
