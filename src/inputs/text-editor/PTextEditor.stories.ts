/* eslint-disable camelcase */
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';
import {
    object, select, boolean, withKnobs,
} from '@storybook/addon-knobs';
import {
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { modes } from '@/inputs/text-editor/config';

export default {
    title: 'Inputs/TextEditor',
    component: PTextEditor,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A182308',
        },
    },
};

const value = {
    server_id: 'server-283cd170d17d',
    name: 'spaceone-dev-eks-cluster_kubectl',
    state: 'INSERVICE',
    primary_ip_address: '172.16.1.205',
    ip_addresses: [
        '172.16.1.205',
    ],
    server_type: 'VM',
    os_type: 'LINUX',
    data: {
        vm: {
            platform_type: 'AWS',
            host: '',
            image: 'ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-20190212.1',
            host_vm_id: '',
            vm_id: 'i-0ec8d5289d9662156',
            vm_name: 'spaceone-dev-eks-cluster_kubectl',
        },
        os: {
            os_distro: 'ubuntu',
            os_arch: 'x86_64',
        },
        base: {
            core: 2,
            memory: 0,
        },
    },
    nics: [
        {
            device_index: 0,
            device: '',
            nic_type: 'PHYSICAL',
            ip_addresses: [
                {
                    ip_address: '172.16.1.205',
                    cidr: '172.16.1.0/24',
                    subnet_id: '',
                },
            ],
            mac_address: '02:d9:d9:07:dc:88',
            tags: {},
        },
    ],
};


export const textEditor = () => ({
    components: { PTextEditor },
    props: {
        item: {
            default: object('item', { ...value }),
        },
        mode: {
            default: select('mode', modes, 'readOnly'),
        },
        loading: {
            default: boolean('loading', false),
        },
    },
    template: `
            <div style="width: 80vw; height:80vh" class="flex flex-wrap">
                <p-text-editor :code="code" 
                               :mode="mode"
                               :loading="loading"
                               class="w-full px-4"
                />
            </div>`,
    setup(props) {
        const state = reactive({
            code: {},
        });
        watch(() => props.item, (after) => {
            state.code = JSON.stringify(after, undefined, 4);
        }, { immediate: true });
        return {
            ...toRefs(state),
        };
    },
});

export const FoldingCase = () => ({
    components: { PTextEditor },
    props: {
        item: {
            default: object('item', { ...value }),
        },
        loading: {
            default: boolean('loading', false),
        },
    },
    template: `
            <div style="width: 80vw; height:80vh" class="flex flex-wrap">
                <p-text-editor :code="code"
                               mode="readOnly"
                               :loading="loading"
                               folded
                               class="w-full px-4"
                />
            </div>`,
    setup(props) {
        const state = reactive({
            code: {},
        });
        watch(() => props.item, (after) => {
            state.code = JSON.stringify(after, undefined, 4);
        }, { immediate: true });
        return {
            ...toRefs(state),
        };
    },
});
