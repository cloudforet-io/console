import { withKnobs } from '@storybook/addon-knobs/vue';
import { ref } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PTag from '@/components/molecules/tags/PTag.vue';
import { tagList } from '@/components/molecules/tags/PTag.toolset';

export default {
    title: 'molecules/tags/Tag',
    component: PTag,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PTag },
    props: {
        ...autoProps(PTag),
    },
    template: '<p-tag v-bind="$props" @delete="onDelete">tag name</p-tag>',
    methods: {
        onDelete: action('delete'),
    },
});

export const listCase = () => ({
    components: { PTag },
    props: {
        ...autoProps(PTag),
    },
    template: `
    <div>
        <p-tag v-for="(tag, idx) in tools.tags" :key="idx + tag"
                        :deletable="deletable"
                        @delete="tools.deleteTag(idx)"
        >
            {{ tag }}
        </p-tag>
        <br><br><br><br>
        <input v-model="newTagName">
        <button @click="tools.addTag(newTagName)">
            add tag
        </button>
        <p>* It doesn't check duplication)</p>
    </div>
    `,
    setup() {
        const tools = tagList(ref([
            'tag1', 'tag2', 'tag3',
        ]));

        const newTagName = ref('newTag');

        return {
            tools,
            newTagName,
        };
    },
});
