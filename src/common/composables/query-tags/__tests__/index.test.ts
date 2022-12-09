import type { PropType } from 'vue';
import {
    computed,
    defineComponent, watch,
} from 'vue';

import { shallowMount, createLocalVue } from '@vue/test-utils';


import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { useQueryTags } from '@/common/composables/query-tags';

const localVue = createLocalVue();

describe('Query Tags Composable', () => {
    const mockComponent = defineComponent({
        props: {
            filters: {
                type: Array as PropType<ConsoleFilter[]>,
                default: () => [],
            },
        },
        setup(props) {
            const referenceStore = {
                Project: computed(() => ({
                    project_aaa: {
                        name: 'project_aaa',
                        label: 'Project A',
                    },
                })),
            };

            const {
                queryTags, setFilters, setQueryTags,
            } = useQueryTags({
                keyItemSets: computed(() => [{
                    title: 'Properties',
                    items: [
                        { name: 'cloud_service_type', label: 'Cloud Service Type' },
                        { name: 'cloud_service_group', label: 'Cloud Service Group' },
                        { name: 'service_code', label: 'Product' },
                        { name: 'project_group_id', label: 'Project Group' },
                        { name: 'project_id', label: 'Project', reference: 'Project' },
                        { name: 'collection_info.service_accounts', label: 'Service Account' },
                        { name: 'account', label: 'Account ID' },
                    ],
                }]),
                referenceStore,
            });

            watch(() => props.filters, (filters) => {
                setFilters(filters);
            });

            return {
                queryTags,
                setFilters,
                setQueryTags,
            };
        },
        template: `
            <div>
                <span v-for="(tag, idx) in queryTags" :key="idx">
                    <span class="key-label">{{tag.key?.label}}</span>
                    <span class="value-label">{{tag.value?.label}}</span>
                </span>
            </div>`,
    });

    const wrapper = shallowMount(mockComponent as any, { localVue });

    it('Nothing appears when queryTags are empty.', () => {
        const keyLabel = wrapper.find('#key-label');
        expect(keyLabel.exists()).toBeFalsy();
    });


    const filters = [{ k: 'project_id', v: 'project_aaa', o: '=' }];
    it('Apply queryTags by setting filters.', async () => {
        await wrapper.setProps({
            filters,
        });
        const keyLabel = wrapper.find('.key-label');
        expect(keyLabel.exists()).toBeTruthy();
    });

    it('The value label of queryTag refers to the value of referenceStore through the reference of keyItemSets.', () => {
        const valueLabelEl = wrapper.find('.value-label');
        expect(wrapper.props().filters).toMatchObject(filters);
        expect(valueLabelEl.exists()).toBeTruthy();
        expect(valueLabelEl.text()).toBe('Project A');
    });
});
