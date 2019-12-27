import PInputTag from './TagsInput';
import { autoProps } from '../../../../.storybook/storybook-util';

export default {
    title: 'Molecules/input-Tag',
    component: PInputTag,
};

const actions = {

};
const data = {
    search: 'This is place Holder',
    enteringVal: '',
    newTag: [],
};

export const defaultCase = () => ({
    components: { PInputTag },
    props: {
        ...autoProps(PInputTag),
    },
    template: `<div style="width: 80vw;">
                    <p-input-tag 
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
