// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-nocheck
//
// import { defineComponent, reactive, toRefs } from 'vue';
//
// import { mount, createLocalVue } from '@vue/test-utils';
//
// import { useProxyValue } from '@/common/composables/proxy-state';
//
// const localVue = createLocalVue();
//
// describe('Proxy State Composable', () => {
//     // eslint-disable-next-line vue/one-component-per-file
//     const ChildComponent = defineComponent({
//         props: {
//             visible: {
//                 type: Boolean,
//                 default: false,
//             },
//             numList: {
//                 type: Array,
//                 default: () => ([]),
//             },
//         },
//         setup(props, { emit }) {
//             const state = reactive({
//                 proxyVisible: useProxyValue('visible', props, emit),
//                 proxyNumList: useProxyValue('num-list', props, emit),
//             });
//
//             return {
//                 ...toRefs(state),
//             };
//         },
//         template: `
//             <div>
//                 <div id="proxy-visible-text">{{ proxyVisible }}</div>
//                 <div id="proxy-num-list-text">{{ proxyNumList }}</div>
//             </div>
//         `,
//
//     });
//     // eslint-disable-next-line vue/one-component-per-file
//     const ParentComponent = defineComponent({
//         components: {
//             ChildComponent,
//         },
//         setup() {
//             const state = reactive({
//                 visible: false,
//                 numList: [],
//             });
//             return {
//                 ...toRefs(state),
//             };
//         },
//         template: `
//             <div>
//                 <child-component :visible.sync="visible" :num-list.sync="numList" />
//                 <div id="visible-text">{{ visible }}</div>
//             </div>
//         `,
//     });
//
//     const initWrappers = () => {
//         const parentWrapper = mount(ParentComponent, { localVue });
//         const childWrapper = parentWrapper.findComponent(ChildComponent);
//         return { parentWrapper, childWrapper };
//     };
//
//     /* Check initial value */
//     it('Check initial value of parent component.', async () => {
//         const { parentWrapper } = initWrappers();
//         const visibleText = parentWrapper.find('#visible-text');
//         expect(visibleText.text()).toBe('false');
//     });
//
//     it('Check initial props of child component.', async () => {
//         const { childWrapper } = initWrappers();
//         expect(childWrapper.vm.visible).toBe(false);
//     });
//
//     it('Check initial proxyValue of child component.', async () => {
//         const { childWrapper } = initWrappers();
//         const proxyVisibleText = childWrapper.find('#proxy-visible-text');
//         expect(proxyVisibleText.text()).toBe('false');
//     });
//
//     /* Change value in parent */
//     it('Change value in parent component and check parent.', async () => {
//         const { parentWrapper } = initWrappers();
//
//         expect(parentWrapper.vm.visible).toBe(false); // initial value
//         await parentWrapper.setData({
//             visible: true,
//         });
//         expect(parentWrapper.vm.visible).toBe(true); // changed value
//     });
//
//     it('Change value at parent component and check child props.', async () => {
//         const { parentWrapper, childWrapper } = initWrappers();
//
//         expect(childWrapper.vm.visible).toBe(false); // initial value
//         await parentWrapper.setData({
//             visible: true,
//         });
//         expect(childWrapper.props('visible')).toBe(true); // changed value
//     });
//
//     it('Change value at parent component and check child proxyValue.', async () => {
//         const { parentWrapper, childWrapper } = initWrappers();
//
//         expect(childWrapper.vm.visible).toBe(false); // initial value
//         await parentWrapper.setData({
//             visible: true,
//         });
//         expect(childWrapper.vm.proxyVisible).toBe(true); // changed value
//     });
//
//     /* Change proxyValue */
//     it('Change proxyValue in child component and check chile template.', async () => {
//         const { childWrapper } = initWrappers();
//         await childWrapper.setData({
//             proxyVisible: true,
//         });
//         const proxyVisibleText = childWrapper.find('#proxy-visible-text');
//         expect(proxyVisibleText.text()).toBe('true');
//     });
//
//     it('Change proxyValue in child component and check props.', async () => {
//         const { childWrapper } = initWrappers();
//         await childWrapper.setData({
//             proxyVisible: true,
//         });
//         expect(childWrapper.props('visible')).toBe(true);
//     });
//
//     it('Change proxyValue in child component and check parent value.', async () => {
//         const { parentWrapper, childWrapper } = initWrappers();
//         await childWrapper.setData({
//             proxyVisible: true,
//         });
//         expect(parentWrapper.vm.visible).toBe(true);
//     });
//
//     /* Check Array Splice */
//     it('Change proxyList in child component and check props.', async () => {
//         const { parentWrapper, childWrapper } = initWrappers();
//         await childWrapper.setData({
//             proxyNumList: [1, 2, 3],
//         });
//
//         const tempList = [...childWrapper.vm.proxyNumList];
//         tempList.splice(1, 1);
//         await childWrapper.setData({
//             proxyNumList: [...tempList],
//         });
//
//         expect(childWrapper.props('numList')).toStrictEqual([1, 3]);
//         expect(childWrapper.vm.proxyNumList).toStrictEqual([1, 3]);
//         expect(parentWrapper.vm.numList).toStrictEqual([1, 3]);
//     });
// });
