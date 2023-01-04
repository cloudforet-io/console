import { createLocalVue, mount } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';
import Vue, { defineComponent, ref } from 'vue';

import { expect } from 'vitest';

import type { UseContextMenuControllerOptions, UseContextMenuControllerReturns } from '@/hooks/context-menu-controller';
import { useContextMenuController } from '@/hooks/context-menu-controller';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';

const localVue = createLocalVue();
type ContextMenuComponent = ComponentPublicInstance<typeof PContextMenu>;
const $t = () => {};

const mockLoadComposableInApp = (getOptions: () => Partial<UseContextMenuControllerOptions>, additional: { menu?: MenuItem[]} = {}) => {
    let result: UseContextMenuControllerReturns|undefined;
    let error;
    const div = document.createElement('div');
    div.id = 'root';
    document.body.appendChild(div);

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
            const visibleMenu = result?.visibleMenu;
            const fixedMenuStyle = result?.fixedMenuStyle;
            const menu = additional.menu ?? result?.reorderedMenu ?? [];

            return {
                targetRef,
                contextMenuRef,
                visibleMenu,
                fixedMenuStyle,
                menu,
            };
        },
        template: `
            <div>
                <button ref="targetRef">target</button>
                <p-context-menu v-show="visibleMenu" 
                                ref="contextMenuRef"
                                id="menu"
                                :menu="menu"
                                :style="fixedMenuStyle"
                />
            </div>
        `,
    });
    const wrapper = mount(mockComponent, {
        localVue,
        attachTo: '#root', // this is for testing focus status
        mocks: {
            $t,
        },
    });
    return { result, error, wrapper };
};

describe('Context Menu Controller', () => {
    describe('useContextMenuController()', () => {
        it('should emit error if targetRef, contextMenu are not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({}));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error if useReorderBySelection is given but originMenu is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                useReorderBySelection: true,
                selected: [],
            }));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error if useReorderBySelection is given but selected is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                useReorderBySelection: true,
                originMenu: [],
            }));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
    });

    describe('Features: ', () => {
        describe('Control menu visibility: ', () => {
            const { result, wrapper } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(false),
            }));
            const { showContextMenu, hideContextMenu } = result as UseContextMenuControllerReturns;
            const contextMenuElement = wrapper.find('#menu');
            it('showContextMenu() should make menu visible.', async () => {
                expect(contextMenuElement?.isVisible()).toBeFalsy();
                showContextMenu();
                await Vue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeTruthy();
            });
            it('hideContextMenu() should hide menu.', async () => {
                hideContextMenu();
                await Vue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeFalsy();
            });
        });


        describe('Get fixed context menu style: ', () => {
            const { result } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(true),
                useFixedStyle: true,
            }));
            const { fixedMenuStyle } = result as UseContextMenuControllerReturns;
            it('fixedMenuStyle should be exist if useFixedStyle option is true.', () => {
                expect(fixedMenuStyle).toBeTruthy();
            });
        });

        describe('Control focusing on menu: ', () => {
            const { result } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(true),
            }), { menu: [{ name: 'a', label: 'A' }, { name: 'b', label: 'B' }, { name: 'c', label: 'C' }] });
            const { focusOnContextMenu } = result as UseContextMenuControllerReturns;
            it('focusOnContextMenu() should focus on context menu element.', async () => {
                expect(document.activeElement?.id).toBeFalsy();
                focusOnContextMenu();
                await Vue.nextTick();
                expect(document.activeElement?.id).toBeTruthy();
            });
        });

        describe('Reorder menu items based on selection: ', () => {
            describe('reorderMenuBySelection()', () => {
                const mockLoadForReorderTest = (options: Partial<UseContextMenuControllerOptions> = {}) => {
                    const { result, error } = mockLoadComposableInApp(() => ({
                        targetRef: ref<HTMLElement|null>(null),
                        contextMenuRef: ref<ContextMenuComponent|null>(null),
                        visibleMenu: ref(true),
                        ...options,
                    }));
                    if (error) throw error;
                    return result as UseContextMenuControllerReturns;
                };
                describe('with useReorderBySelection option false: ', () => {
                    const { reorderMenuBySelection } = mockLoadForReorderTest();
                    const menuItems: MenuItem[] = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }];
                    it('should return array which is the same with origin if there is no selected item.', () => {
                        const newMenuItems = reorderMenuBySelection([], menuItems);
                        expect(newMenuItems).toEqual(menuItems);
                    });
                    it('should return array rearranged so that the selected items are at the front.', () => {
                        const newMenuItems = reorderMenuBySelection([{ name: 'b' }, { name: 'a' }], menuItems);
                        expect(newMenuItems).toEqual([{ name: 'b' }, { name: 'a' }, { type: 'divider', name: 'selection-divider' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                    });
                    // this is the test for strict mode. it's not supported yet.
                    // it('should return array that doesn\'t include an item which is not in origin(second argument).', () => {
                    //     const newMenuItems = reorderMenuBySelection([{ name: 'zzzzz' }, { name: 'b' }, { name: 'a' }], menuItems);
                    //     expect(newMenuItems).toEqual([{ name: 'b' }, { name: 'a' }, { type: 'divider', name: 'selection-divider' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                    // });
                });
                describe('with useReorderBySelection option true: ', () => {
                    const selected = ref([{ name: 'a' }]);
                    const originMenu = ref([{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                    const {
                        reorderMenuBySelection, reorderedMenu, hideContextMenu, showContextMenu,
                    } = mockLoadForReorderTest({
                        useReorderBySelection: true,
                        originMenu,
                        selected,
                    });

                    it('reorderedMenu should be updated when reorderedMenuBySelection() is executed.', () => {
                        const newMenuItems = reorderMenuBySelection();
                        expect(newMenuItems).toEqual(reorderedMenu.value);
                    });
                    it('reorderedMenu should be updated by executing reorderedMenuBySelection() after making changes to the selected ref.', () => {
                        selected.value = [];
                        reorderMenuBySelection();
                        expect(originMenu.value).toEqual(reorderedMenu.value);
                        selected.value = [{ name: 'b' }, { name: 'a' }];
                        reorderMenuBySelection();
                        expect(reorderedMenu.value).toEqual([{ name: 'b' }, { name: 'a' }, { type: 'divider', name: 'selection-divider' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                    });
                    it('reorderedMenu should be updated by executing showContextMenu(true) after making changes to the selected ref.', () => {
                        selected.value = [];
                        showContextMenu(true);
                        expect(originMenu.value).toEqual(reorderedMenu.value);
                        selected.value = [{ name: 'b' }, { name: 'a' }];
                        showContextMenu(true);
                        expect(reorderedMenu.value).toEqual([{ name: 'b' }, { name: 'a' }, { type: 'divider', name: 'selection-divider' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                    });
                    it('reorderedMenu should be updated by executing hideContextMenu(true) after making changes to the selected ref.', () => {
                        selected.value = [];
                        hideContextMenu(true);
                        expect(originMenu.value).toEqual(reorderedMenu.value);
                        selected.value = [{ name: 'b' }, { name: 'a' }];
                        hideContextMenu(true);
                        expect(reorderedMenu.value).toEqual([{ name: 'b' }, { name: 'a' }, { type: 'divider', name: 'selection-divider' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                    });
                    it('If the value of originMenu ref is changed, the changed value should be reflected in reorderedMenu after reordering menu.', () => {
                        selected.value = [{ name: 'a' }];
                        const newItems = reorderMenuBySelection();
                        expect(newItems).toEqual(reorderedMenu.value);

                        originMenu.value = [{ name: 'c' }, { name: 'b' }, { name: 'd' }, { name: 'a' }];
                        reorderMenuBySelection();
                        expect(reorderedMenu.value).toEqual([{ name: 'a' }, { type: 'divider', name: 'selection-divider' }, { name: 'c' }, { name: 'b' }, { name: 'd' }]);

                        // this is the test for strict mode. it's not supported yet.
                        // originMenu.value = [{ name: 'c' }, { name: 'b' }, { name: 'd' }];
                        // reorderMenuBySelection();
                        // expect(reorderedMenu.value).toEqual([{ name: 'c' }, { name: 'b' }, { name: 'd' }]);
                    });
                });
            });
        });
    });
});
