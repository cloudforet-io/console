import PTagsInput from '@/components/molecules/tags-input/TagsInput';
import { autoProps } from '../../../../.storybook/storybook-util';

export default {
    title: 'Molecules/tags-input',
    component: PTagsInput,
};

const actions = {

};
const data = {
    search: 'This is place Holder',
    enteringVal: '',
    newTag: [],
};

export const defaultCase = () => ({
    components: { PTagsInput },
    props: {
        ...autoProps(PTagsInput),
    },
    template: `<div style="width: 80vw;">
                    <p-tags-input 
                    :tagText.sync="enteringVal"
                    :tagArray.sync="newTag"
                    :tagPlaceHolder="search" 
                    />
                    <br>
                    This is text : {{ enteringVal }}
                    <br>
                    this tag values : {{ newTag }}
                </div>`,
    methods: {
        ...actions,
    },
    data() {
        return {
            ...data,
        };
    },
});
