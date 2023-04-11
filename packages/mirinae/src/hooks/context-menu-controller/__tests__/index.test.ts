import { createLocalVue, mount } from '@vue/test-utils';
import type { ComponentPublicInstance } from 'vue';
import { defineComponent, ref } from 'vue';

import { describe, expect } from 'vitest';

import type { UseContextMenuControllerOptions } from '@/hooks/context-menu-controller';
import { useContextMenuController } from '@/hooks/context-menu-controller';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';

const localVue = createLocalVue();

type ContextMenuComponent = ComponentPublicInstance<typeof PContextMenu>;
const $t = () => {};
type UseContextMenuControllerReturns = ReturnType<typeof useContextMenuController>;

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
            const contextMenuStyle = result?.contextMenuStyle;
            const menu = additional.menu ?? result?.refinedMenu ?? [];

            return {
                targetRef,
                contextMenuRef,
                visibleMenu,
                contextMenuStyle,
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
                                :style="contextMenuStyle"
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
    describe('Options: ', () => {
        it('should emit error if targetRef is not given.', () => {
            const { result, error } = mockLoadComposableInApp(() => ({}));
            expect(error).toBeTruthy();
            expect(result).toBeFalsy();
        });
        it('should emit error when useReorderBySelection is true, but menu and handler are not given.', () => {
            const { error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useReorderBySelection: true,
                selected: [],
            }));
            expect(error).toBeTruthy();
        });
        it('should emit error when useReorderBySelection is true, and menu or handler is given but selected is not given.', () => {
            const { error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useReorderBySelection: true,
                menu: [],
            }));
            expect(error).toBeTruthy();
            const { error: secondError } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useReorderBySelection: true,
                handler: ref(() => ({ results: [] })),
            }));
            expect(secondError).toBeTruthy();
        });
        it('should NOT emit error when useReorderBySelection is true, and menu or handler and selected are given.', () => {
            const { error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useReorderBySelection: true,
                menu: [],
                selected: [],
            }));
            expect(error).toBeFalsy();
            const { error: secondError } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useReorderBySelection: true,
                handler: ref(() => ({ results: [] })),
                selected: [],
            }));
            expect(secondError).toBeFalsy();
        });
        it('should emit error when useMenuFiltering is true, but menu and handler are not given.', () => {
            const { error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useMenuFiltering: true,
                searchText: ref(''),
            }));
            expect(error).toBeTruthy();
        });
        it('should emit error when useMenuFiltering is true, and menu or handler is given but searchText is not given.', () => {
            const { error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useMenuFiltering: true,
                menu: [],
            }));
            expect(error).toBeTruthy();
            const { error: secondError } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useMenuFiltering: true,
                handler: ref(() => ({ results: [] })),
            }));
            expect(secondError).toBeTruthy();
        });
        it('should NOT emit error when useMenuFiltering is true, and menu or handler and selected are given.', () => {
            const { error } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useMenuFiltering: true,
                menu: [],
                searchText: ref(''),
            }));
            expect(error).toBeFalsy();
            const { error: secondError } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                useMenuFiltering: true,
                handler: ref(() => ({ results: [] })),
                searchText: ref(''),
            }));
            expect(secondError).toBeFalsy();
        });
    });

    describe('Features: ', () => {
        describe('showContextMenu(): ', () => {
            const { result, wrapper } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(false),
            }));
            const { showContextMenu } = result as UseContextMenuControllerReturns;
            const contextMenuElement = wrapper.find('#menu');
            it('should make menu visible.', async () => {
                expect(contextMenuElement?.isVisible()).toBeFalsy();
                showContextMenu();
                await localVue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeTruthy();
            });
        });
        describe('hideContextMenu(): ', () => {
            const { result, wrapper } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(true),
            }));
            const { hideContextMenu } = result as UseContextMenuControllerReturns;
            const contextMenuElement = wrapper.find('#menu');
            it('hideContextMenu() should hide menu.', async () => {
                hideContextMenu();
                await localVue.nextTick();
                expect(contextMenuElement?.isVisible()).toBeFalsy();
            });
        });

        describe('focusOnContextMenu(): ', () => {
            const { result } = mockLoadComposableInApp(() => ({
                targetRef: ref<HTMLElement|null>(null),
                contextMenuRef: ref<ContextMenuComponent|null>(null),
                visibleMenu: ref(true),
            }), { menu: [{ name: 'a', label: 'A' }, { name: 'b', label: 'B' }, { name: 'c', label: 'C' }] });
            const { focusOnContextMenu } = result as UseContextMenuControllerReturns;
            it('should focus on context menu element.', async () => {
                expect(document.activeElement?.id).toBeFalsy();
                focusOnContextMenu();
                await localVue.nextTick();
                expect(document.activeElement?.id).toBeTruthy();
            });
        });

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
        describe('useReorderBySelection: ', () => {
            describe('initiateMenu(): ', () => {
                const selected = ref([{ name: 'a' }]);
                const menu = ref([{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                const visibleMenu = ref(false);
                const {
                    refinedMenu, initiateMenu,
                } = mockLoadForReorderTest({
                    visibleMenu,
                    useReorderBySelection: true,
                    menu,
                    selected,
                });
                it('refinedMenu should be rearranged by executing initiateMenu().', async () => {
                    await initiateMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a', 'selection-divider', 'b', 'c', 'd', 'e']);
                });
                it('refinedMenu should be updated by executing initiateMenu() after making changes to the selected ref.', async () => {
                    selected.value = [];
                    await initiateMenu();
                    expect(menu.value.map((d) => d.name)).toEqual(refinedMenu.value.map((d) => d.name));
                    selected.value = [{ name: 'b' }, { name: 'a' }];
                    await initiateMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['b', 'a', 'selection-divider', 'c', 'd', 'e']);
                });
                it('refinedMenu should be the same with origin if there is no selected item even if after executing initiateMenu().', async () => {
                    selected.value = [];
                    menu.value = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }];
                    await initiateMenu();
                    expect(menu.value.map((d) => d.name)).toEqual(refinedMenu.value.map((d) => d.name));
                });
                it('refinedMenu should be rearranged so that the selected items are at the front by running initiateMenu().', async () => {
                    selected.value = [{ name: 'b' }, { name: 'a' }];
                    menu.value = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }];
                    await initiateMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['b', 'a', 'selection-divider', 'c', 'd', 'e']);
                });
            });
            describe('reloadMenu(): ', () => {
                const selected = ref([{ name: 'a' }]);
                const menu = ref([{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }]);
                const visibleMenu = ref(false);
                const {
                    refinedMenu, initiateMenu, reloadMenu,
                } = mockLoadForReorderTest({
                    visibleMenu,
                    useReorderBySelection: true,
                    menu,
                    selected,
                });
                it('refinedMenu should apply updated menu by executing reloadMenu().', async () => {
                    await initiateMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a', 'selection-divider', 'b', 'c', 'd', 'e']);
                    menu.value = [{ name: 'a' }, { name: 'bb' }, { name: 'cc' }, { name: 'dd' }, { name: 'ee' }];
                    await reloadMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a', 'selection-divider', 'bb', 'cc', 'dd', 'ee']);
                });
                it('refinedMenu should NOT be rearranged by executing reloadMenu().', async () => {
                    selected.value = [{ name: 'a' }];
                    menu.value = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }, { name: 'e' }];
                    await initiateMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a', 'selection-divider', 'b', 'c', 'd', 'e']);
                    selected.value = [{ name: 'a' }, { name: 'b' }];
                    await reloadMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a', 'selection-divider', 'b', 'c', 'd', 'e']);
                    expect(refinedMenu.value.map((d) => d.name)).not.toEqual(['a', 'b', 'selection-divider', 'c', 'd', 'e']);
                });
            });
        });

        describe('useMenuFiltering: ', () => {
            describe('initiateMenu(): ', () => {
                const searchText = ref('');
                const menu = ref([{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }, { name: 'c', label: 'c' }, { name: 'd', label: 'd' }, { name: 'e', label: 'e' }]);
                const visibleMenu = ref(false);
                const {
                    refinedMenu, initiateMenu,
                } = mockLoadForReorderTest({
                    visibleMenu,
                    useMenuFiltering: true,
                    menu,
                    searchText,
                });
                it('refinedMenu should be updated based on searchText by executing initiateMenu().', async () => {
                    searchText.value = 'a';
                    await initiateMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a']);
                });
            });
            describe('reloadMenu(): ', () => {
                const searchText = ref('');
                const menu = ref([{ name: 'a', label: 'a' }, { name: 'b', label: 'b' }, { name: 'c', label: 'c' }, { name: 'd', label: 'd' }, { name: 'e', label: 'e' }]);
                const visibleMenu = ref(false);
                const {
                    refinedMenu, reloadMenu,
                } = mockLoadForReorderTest({
                    visibleMenu,
                    useMenuFiltering: true,
                    menu,
                    searchText,
                });
                it('refinedMenu should be updated based on searchText by executing reloadMenu().', async () => {
                    searchText.value = 'a';
                    await reloadMenu();
                    expect(refinedMenu.value.map((d) => d.name)).toEqual(['a']);
                });
            });
        });
    });
});

