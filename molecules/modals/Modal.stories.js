import { number, select, button } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import PModal from './Modal.vue';
import { sizeMapping } from './ModalMapping';
import { autoProps } from '../../../setup/storybook-util';

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
    :keyboard="keyboard"
    :backdrop="backdrop"
    @shown="shown"
    @hidden="hidden"
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
    size: {
      default: select('size', [null, ...Object.keys(sizeMapping)]),
    },
    ...autoProps(PModal, [
      { name: 'centered' },
      { name: 'backdrop' },
      { name: 'fade' },
      { name: 'keyboard' },
    ]),
    // showBtn:{
    //     default:button('show',()=>this.showAction())
    // }
  },
  computed: {
    lorem() {
      return faker.lorem.lines(this.loremLength);
    },
  },
  methods: {
    showAction() {
      this.$refs.modal.show();
    },
    closeAction() {
      this.$refs.modal.hide();
    },
    ...actions,
  },
});
