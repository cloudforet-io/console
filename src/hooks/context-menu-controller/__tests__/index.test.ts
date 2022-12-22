import { createLocalVue, mount } from '@vue/test-utils';
import Vue, { defineComponent, ref } from 'vue';

import type { UseContextMenuControllerOptions, UseContextMenuControllerReturns } from '@/hooks/context-menu-controller';
import { useContextMenuController } from '@/hooks/context-menu-controller';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';

const localVue = createLocalVue();

const mockLoadComposableInApp = (getOptions: () => Partial<UseContextMenuControllerOptions>) => {
    let result: UseContextMenuControllerReturns|undefined;
    let error;
    const mockComponent = defineComponent({
        components: {
            PContextMenu,
        },
        setup() {
            const options = getOptions();
            try {
                result = useContextMenuController(options as UseContextMenuControllerOptions);
            } catch (e) {
                error = e;
            }

            const targetRef = options.targetRef;
            const contextMenuRef = options.contextMenuRef;
            const visibleMenu = options.visibleMenu;
            const fixedMenuStyle = options.fixedMenuStyle;

            return {
                targetRef,
                contextMenuRef,
                visibleMenu,
                fixedMenuStyle,
            };
        },
        template: `
            <div>
                <button ref="targetRef">target</button>
                <p-context-menu v-show="visibleMenu" 
                                ref="contextMenuRef"
                                id="menu"
                                :style="fixedMenuStyle"
                />
            </div>
        `,
    });
    const wrapper = mount(mockComponent as any, { localVue });
    return { result, error, wrapper };
};

describe('Context Menu Controller', () => {
    describe('useContextMenuController()', () => {
        it('should emit error if targetRef, contextMenu are not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({}));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error if useReorderBySelection is given but menu is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<Vue|null>(null),
                useReorderBySelection: true,
            }));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
    });

    describe('useContextMenuController() returns: ', () => {
        const { result, wrapper } = mockLoadComposableInApp(() => ({
            targetRef: ref<HTMLElement|null>(null),
            contextMenuRef: ref<Vue|null>(null),
            visibleMenu: ref(false),
            useReorderBySelection: true,
            menu: ref([]),
            useFixedStyle: true,
        }));
        // const contextMenuRef = wrapper.findComponent({ ref: 'contextMenuRef' });
        // expect(contextMenuRef).toBeTruthy();
        const { showContextMenu, hideContextMenu, fixedMenuStyle } = result as UseContextMenuControllerReturns;
        const contextMenuElement = wrapper.find('#menu');

        describe('showContextMenu()', () => {
            it('should make menu visible.', async () => {
                expect(contextMenuElement?.isVisible()).toBeFalsy();
                showContextMenu();
                await Vue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeTruthy();
            });
        });
        describe('hideContextMenu()', () => {
            it('should hide menu.', async () => {
                hideContextMenu();
                await Vue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeFalsy();
            });
        });

        describe('fixedMenuStyle', () => {
            it('should exist if useFixedStyle option is true.', async () => {
                expect(fixedMenuStyle).toBeTruthy();
            });
        });
    });
});
