import { action } from '@storybook/addon-actions';
import { object, select } from '@storybook/addon-knobs';
import { ref } from '@vue/composition-api';
import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PI from '@/components/atoms/icons/PI.vue';
import md from './ContextMenu.md';
import style from './PContextMenu.stories.scss';

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
    clickAdd: action('add:select'),
    clickHello: action('hello:select'),
    clickDelete: action('delete:select'),
    clickUpdate: action('update:select'),
    clickCollect: action('collect:select'),
    clickRemove: action('remove:select'),
    menuSelect: action('select'),
    onEndOfUpKey: action('keyup:up:end'),
    onEndOfDownKey: action('keyup:down:end'),
    onEscKey: action('keyup:esc'),
};

const knobs = {
    theme: {
        default: select('theme', ['secondary', 'gray900'], 'secondary'),
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
};

export const defaultCase = () => ({
    components: { PContextMenu },
    template: `
<div>
    <!--  position:static 은 스토리북에서 편하게 보기 위해 임시로 주었습니다.  -->
    <p-context-menu
      style="position:static" 
      ref="contextRef"
      @select="menuSelect"
      @add:select="clickAdd"
      @hello:select='clickHello'
      @delete:select='clickDelete'
      @update:select='clickUpdate'
      @collect:select='clickCollect'
      @remove:select='clickRemove' 
      @keyup:up:end="onEndOfUpKey"
      @keyup:down:end="onEndOfDownKey"
      @keyup:esc="onEscKey"
      :menu="menu"
      :theme="theme"
    />
    <div>
        <p>부모 컴포넌트에서 컨텍스트 메뉴에 포커싱을 주고 싶을 경우 .focus 함수를 싱핼 하면 됩니다</p>
        <p>일단 컨텍스 메뉴에 포커싱 되면 이후에는 컨텍스트 메뉴 내부에서 단축키가 작동합니다</p>
        <button @click="contextRef.focus()">자동 포커싱</button>
    </div>
</div>`,
    props: knobs,
    setup() {
        const contextRef = ref(null);
        return {
            ...actions,
            contextRef,
        };
    },
});


export const slotCase = () => ({
    components: { PContextMenu, PEmpty, PI },
    template: `
<div class="flex">
    <!--  position:static 은 스토리북에서 편하게 보기 위해 임시로 주었습니다.  -->
    <div class="ml-4">
        <p class="mb-2 font-bold">Slot Types</p>
        <table>
            <thead>
                <th>Name</th>
                <th>Derived</th>
                <th width="200">Original Example</th>
                <th width="200">Slot Example</th>
                <th>Props</th>
            </thead>
            <tbody>
                <tr>
                    <td>loading</td>
                    <td>loading-format</td>
                    <td>
                        <p-context-menu style="position: static;"
                                        loading
                        />
                    </td>
                    <td>
                        <p-context-menu style="position: static;"
                                        loading
                        >
                            <template #loading>
                                <div style="height: 2rem; line-height: 2rem; text-align: center">
                                    ...loading
                                </div>
                            </template>
                        </p-context-menu>
                    </td>
                    <td>{...props, uuid}</td>
                </tr>
                <tr>
                    <td>no-data</td>
                    <td>no-data-format</td>
                    <td>
                        <p-context-menu style="position: static;"
                        />
                    </td>
                    <td>
                        <p-context-menu style="position: static;"
                        >
                            <template #no-data>
                                <p-empty>No Data</p-empty>
                            </template>
                        </p-context-menu>
                    </td>
                    <td>{...props, uuid}</td>
                </tr>
                <tr>
                    <td>menu</td>
                    <td></td>
                    <td>
                        <p-context-menu style="position: static;"
                                        :menu="menu"
                        >
                        </p-context-menu>
                    </td>
                    <td>
                        <p-context-menu style="position: static;"
                                        :menu="menu"
                        >
                            <template #menu="{menu}">
                                <template v-for="(m, i) in menu">
                                    <div v-if="m.type === 'item'" 
                                          :key="i"
                                         class="border-b border-blue-200 py-1 text-center text-xs"
                                    >
                                        {{m.label}}
                                    </div>
                                </template>
                            </template>
                        </p-context-menu>
                    </td>
                    <td>{...props, uuid}</td>
                </tr>
                <tr>
                    <td>item</td>
                    <td>
                        item-{name}<br>
                        item--format<br>
                        item-{name}-format
                    </td>
                    <td>
                        <p-context-menu style="position: static;"
                                        :menu="menu"
                        />
                    </td>
                    <td>
                        <ul>
                            <li>
                                <p class="mb-1">item</p>
                                <p-context-menu style="position: static;"
                                                :menu="menu"
                                >
                                    <template #item="{item}">
                                        <div>
                                            <p-i name="btn_gnb_top-logo"/>
                                            {{item.label}}
                                        </div>
                                    </template>
                                </p-context-menu>
                            </li>
                            <li>
                                <p class="mb-1">item--format</p>
                                <p-context-menu style="position: static;"
                                                :menu="menu"
                                >
                                    <template #item--format="{item}">
                                        <p-i name="btn_gnb_top-logo"/>
                                        {{item.label}}
                                    </template>
                                </p-context-menu>
                            </li>
                        </ul>
                    </td>
                    <td>{...props, uuid, item, index}</td>
                </tr>
                <tr>
                    <td>divider</td>
                    <td>divider-{name}</td>
                    <td>
                        <p-context-menu style="position: static;"
                                        :menu="menu"
                        />
                    </td>
                    <td>
                        <p-context-menu style="position: static;"
                                        :menu="menu"
                        >
                            <template #divider>
                                <div class="border border-red-200"></div>
                            </template>
                        </p-context-menu>
                    </td>
                    <td>{...props, uuid, item, index}</td>
                </tr>
                <tr>
                    <td>header</td>
                    <td>
                        header-{name}<br>
                        header--format<br>
                        header-{name}-format
                    </td>
                    <td>
                        <p-context-menu style="position: static;"
                                        :menu="menu"
                        />
                    </td>
                    <td>
                        <p-context-menu style="position: static;"
                                        :menu="menu"
                        >
                            <template #header="{item}">
                                <div class="text-red-200 text-sm text-center">{{item.label || item.name}}</div>
                            </template>
                        </p-context-menu>
                    </td>
                    <td>{...props, uuid, item, index}</td>
                </tr>
            </tbody>
        </table>
    </div>
    
</div>`,
    props: knobs,
    setup() {
        const contextRef = ref(null);
        return {
            ...actions,
            contextRef,
        };
    },
}
);
