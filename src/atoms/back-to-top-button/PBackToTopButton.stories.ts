import PBackToTopButton from '@/atoms/back-to-top-button/PBackToTopButton.vue';
import { select, text } from '@storybook/addon-knobs';
import { ref } from '@vue/composition-api';

export default {
    title: 'Navigation/BackToTopButton',
    component: { PBackToTopButton },
    parameters: {
        info: {
            summary: '',
            components: { PBackToTopButton },
        },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5870%3A136238',
        },
    },
};

export const backToTopButton = () => ({
    components: { PBackToTopButton },
    template: `
        <div ref="containerRef" style="height: 200vh; overflow: scroll; width: 100px;" >
          <p-back-to-top-button
            :location="location"
            :container="containerRef"
            :margin="margin"
          />
        </div>`,
    props: {
        location: {
            default: select('location', ['bottomRight', 'topRight'], 'bottomRight'),
        },
        margin: {
            default: text('margin', '2.5rem 1rem'),
        },
    },
    setup() {
        const containerRef = ref(undefined);

        return {
            containerRef,
        };
    },
});
