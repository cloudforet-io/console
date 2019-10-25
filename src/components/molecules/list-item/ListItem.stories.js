import PListItem from './ListItem.vue';
import { autoProps } from '../../../setup/storybook-util';


export default {
    title: 'Molecules/list-item',
    component: PListItem,
};

export const defaultCase = () => ({
    components: { PListItem },
    props: {
        ...autoProps(PListItem),
    },
    template: `<div>
                    <p-list-item :icon="icon" :contents="contents"/>
                    <br><br>
                    <p>sample icon</p>
                    <ul>
                        <li>fa-address-card</li>
                        <li>fa-bomb</li>
                        <li>fa-check</li>
                        <li>fa-cog</li>
                        <li>fa-copyright</li>
                    </ul>
                    <a href="https://fontawesome.com/icons" target="_blank">more icon...</a>
                </div>`,
});
