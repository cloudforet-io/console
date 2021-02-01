import { reactive, toRefs } from '@vue/composition-api';
import { boolean, withKnobs } from '@storybook/addon-knobs';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';

export default {
    title: 'FeedBacks/Loading/Lazy Image',
    component: PLazyImg,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A133538',
        },
    },
};

export const lazyImg = () => ({
    components: { PLazyImg },
    template: `        
        <div>
            <p-lazy-img :src="iconUrl"
                        :loading="loading"
                        width="2rem" height="2rem"
            />
        </div>`,
    props: {
        loading: {
            default: boolean('loading', false),
        },
    },
    setup() {
        const state = reactive({
            iconUrl: '',
        });

        return {
            ...toRefs(state),
        };
    },
});
