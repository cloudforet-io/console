import { action } from '@storybook/addon-actions';
import { object, select } from '@storybook/addon-knobs';
import { ref } from '@vue/composition-api';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import md from './ContextMenu.md';

export default {
    title: 'organisms/context-menu/context-menu',
    component: PContextMenu,
    parameters: {
        notes: md,
        info: {
            summary: md,
            components: { PContextMenu },
        },
    },
};
const actions = {
    clickAdd: action('clickAdd'),
    clickHello: action('clickHello'),
    clickDelete: action('clickDelete'),
    clickUpdate: action('clickUpdate'),
    clickCollect: action('clickCollect'),
    clickRemove: action('clickRemove'),
    clickMenuEvent: action('clickMenuEvent'),
    onEndOfUpKey: action('onEndOfUpKey'),
    onEndOfDownKey: action('onEndOfDownKey'),
    onEscKey: action('onEscKey'),
};

export const defaultCase = () => ({
    components: { PContextMenu },
    template: `
<div>
    <!--  position:static 은 스토리북에서 편하게 보기 위해 임시로 주었습니다.  -->
    <PContextMenu
      style="position:static" 
      ref="contextRef"
      @clickMenuEvent="clickMenuEvent"
      @click-add="clickAdd"
      @click-hello='clickHello'
      @click-delete='clickDelete'
      @click-update='clickUpdate'
      @click-collect='clickCollect'
      @click-remove='clickRemove' 
      @onEndOfUpKey="onEndOfUpKey"
      @onEndOfDownKey="onEndOfDownKey"
      @onEscKey="onEscKey"
      :menu="menu"
      :theme="theme"
    />
    <div>
        <p>부모 컴포넌트에서 컨텍스트 메뉴에 포커싱을 주고 싶을 경우 .focus 함수를 싱핼 하면 됩니다</p>
        <button @click="contextRef.focus()">자동 포커싱</button>
    </div>
    
</div>`,
    props: {
        theme: {
            default: select('theme', ['secondary', 'dark'], 'secondary'),
        },
        menu: {
            default: object('menu', [
                {
                    type: 'item', label: 'add', name: 'add', disabled: false,
                },
                {
                    type: 'item', label: 'hello', name: 'hello', disabled: false,
                },
                { type: 'divider' },
                { type: 'header', label: 'this is header' },
                {
                    type: 'item', label: 'update', name: 'update', disabled: false,
                },
                {
                    type: 'item', label: 'delete', name: 'delete', disabled: true,
                },
                { type: 'divider' },
                {
                    type: 'item', label: 'collect', name: 'collect', disabled: false,
                },
                { type: 'divider' },
                {
                    type: 'item', label: 'remove', name: 'remove', disabled: false,
                },


            ]),
        },
    },
    setup() {
        const contextRef = ref(null);
        return {
            ...actions,
            contextRef,
        };
    },
}
);
