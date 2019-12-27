import TagsInputSearch from './TagsInputSearch.vue';

export default {
    title: 'test',
    component: TagsInputSearch,
    parameters: {
        info: {
            summary: '',
            components: { TagsInputSearch },
        },
    },
};
const actions = {};
const data = {};

export const search = () => ({
    components: { TagsInputSearch },
    template: `

<TagsInputSearch
  v-model="tag"
  :tags="tags"
  :allow-edit-tags="true"
  :autocomplete-items="items"
  class="tags-input"
  @tags-changed="newTags => tags = newTags"
>
  <div
    slot="autocomplete-item"
    slot-scope="props"
    class="my-item"
    @click="props.performAdd(props.item)"
  >
    <i
      :style="{ color: props.item.iconColor }"
      class="material-icons"
    >
      {{ props.item.text }}
    </i>{{ props.item.text }}
  </div>
  <div
    slot="tag-left"
    slot-scope="props"
    class="my-tag-left"
    @click="props.performOpenEdit(props.index)"
  >
    <i
      :style="{ color: props.tag.iconColor }"
      class="material-icons"
    >
      {{ props.tag.text }}
    </i>
  </div>
</TagsInputSearch>`,
    data() {
        return {
            tag: '',
            tags: [],
            icons: [{
                text: 'done',
                iconColor: '#086A87',
            }, {
                text: 'fingerprint',
                iconColor: '#8A0886',
            }, {
                text: 'label',
                iconColor: '#B43104',
            }, {
                text: 'pregnant_woman',
            }, {
                text: 'touch_app',
                iconColor: '#AC58FA',
            }, {
                text: 'group_work',
            }, {
                text: 'pets',
                iconColor: '#8A4B08',
            }],
        };
    },
    computed: {
        items() {
            return this.icons.filter(i => i.text.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1);
        },
    },
    // props: {
    //     ...autoProps(VueTagsInput),
    // },
    methods: {
        ...actions,
    },
});
