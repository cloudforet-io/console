import { number, select, boolean } from '@storybook/addon-knobs';
import PButton from '@/inputs/buttons/button/PButton.vue';
import { sizeMapping } from '@/feedbacks/modals/modal/type';
import PContentModal from '@/feedbacks/modals/content-modal/PContentModal.vue';
import faker from 'faker';
import { computed, ref } from '@vue/composition-api';

export default {
    title: 'Feedbacks/Modals/Deprecated/Content Modal',
    component: PContentModal,
    parameters: {
        centered: { disable: true },
    },
};


export const modal = () => ({
    components: { PContentModal, PButton },
    template: `<p-content-modal
                    ref="modal"
                    :scrollable="scrollable" 
                    :centered="centered"
                    :size="size"
                    :headerVisible="headerVisible"
                    :bodyVisible="bodyVisible"
                    :footerVisible="footerVisible"
                    :visible.sync="visible"
                    :themeColor="primary"
                >
                    <template #header>This is Header.</template>
                    <template #body>
                        <p>{{lorem}}</p> 
                    </template>  
                    <template #footer>this is Footer.</template>
                </p-content-modal>
            `,
    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },
        headerVisible: {
            default: boolean('headerVisible', true),
        },
        bodyVisible: {
            default: boolean('headerVisible', true),
        },
        footerVisible: {
            default: boolean('headerVisible', true),
        },
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], 'sm'),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
        centered: {
            default: boolean('centered', false),
        },
        backdrop: {
            default: boolean('backdrop', true),
        },
        fade: {
            default: boolean('fade', true),
        },
    },

    setup(props) {
        const visible = ref(false);
        const lorem = computed(() => faker.lorem.lines(props.loremLength));
        const click = () => {
            visible.value = true;
        };
        return {
            visible,
            lorem,
            click,
        };
    },
});

export const fade = () => ({
    components: { PContentModal, PButton },
    template: `<div>
                <p-button styleType="primary" @click="click">Launch a modal</p-button>
                <p-content-modal
                    ref="modal" 
                    :scrollable="scrollable" 
                    :centered="centered"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :headerVisible="headerVisible"
                    :bodyVisible="bodyVisible"
                    :footerVisible="footerVisible"
                    :visible.sync="visible"
                    >
                    <template #header>This is Header</template>
                    <template>
                        <p>{{lorem}}</p> 
                    </template>  
                    <template #footer><p-button styleType="danger" @click="close">닫기</p-button></template>
                </p-content-modal>
                </div>`,
    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
            headerVisible: {
                default: boolean('headerVisible', true),
            },
            bodyVisible: {
                default: boolean('headerVisible', true),
            },
            footerVisible: {
                default: boolean('headerVisible', true),
            },
            size: {
                default: select('size', ['', ...Object.keys(sizeMapping)], 'sm'),
            },
            scrollable: {
                default: boolean('scrollable', false),
            },
            centered: {
                default: boolean('centered', false),
            },
            backdrop: {
                default: boolean('backdrop', true),
            },
            fade: {
                default: boolean('fade', true),
            },
        },
        setup(props) {
            const visible = ref(false);
            const lorem = computed(() => faker.lorem.lines(props.loremLength));
            const click = () => {
                visible.value = true;
            };
            const close = () => {
                visible.value = false;
            };
            return {
                visible,
                lorem,
                click,
                close,
            };
        },
    },
});
