import PBackToTopButton from '@/navigation/scrolls/back-to-top-button/PBackToTopButton.vue';
import { select, text, withKnobs } from '@storybook/addon-knobs';
import { ref } from '@vue/composition-api';

export default {
    title: 'Navigation/Scrolls',
    component: { PBackToTopButton },
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A189268',
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
