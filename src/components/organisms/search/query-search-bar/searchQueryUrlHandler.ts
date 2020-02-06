import _ from 'lodash';
import { reactive, Ref, ref } from '@vue/composition-api';
import Vue from 'vue';


export class TagList {
    public tags: Ref<Array<string>>;

    public checkDuplicate: boolean = true;

    public eventBus: Vue;

    public eventName: string;

    constructor(proxyTags: Ref<Array<string>>,
        checkDuplicate:boolean, eventBus: Vue, eventName: string) {
        this.tags = proxyTags || ref([]);
        if (this.tags.value) this.tags.value = [];

        this.checkDuplicate = checkDuplicate;
        this.eventBus = eventBus;
        this.eventName = eventName;
    }

    deleteTag = (idx): void => {
        const updatedTags = [...this.tags.value];
        updatedTags.splice(idx, 1);
        this.tags.value = updatedTags;
        if (this.eventBus) { this.eventBus.$emit(this.eventName, this.tags.value); }
    }

    deleteAllTags = (): void => {
        this.tags.value = [];
        if (this.eventBus) { this.eventBus.$emit(this.eventName, this.tags.value); }
    }

    validation = (value): boolean => this.tags.value.every(tag => !_.isEqual(tag, value))

    addTag(value: any): void {
        const val = (typeof value === 'string') ? value.trim() : value;
        if (!val || val === '') return;
        if (this.checkDuplicate && !this.validation(val)) return;

        const updatedTags = [...this.tags.value];
        updatedTags.push(val);
        this.tags.value = updatedTags;
        if (this.eventBus) { this.eventBus.$emit(this.eventName, this.tags.value); }
    }
}

export class SearchQueryUrlHandler {
    public context: object;

    public listTools: TagList;

    public tags: object;

    constructor(context, listTools: TagList) {
        this.context = context;
        this.listTools = listTools;
        this.tags = listTools.tags;
    }

    // checkUrlDuplicated = (newItem, searchItems) => searchItems.every(search => search !== newItem);
    //
    // addQueryToUrl = (query) => {
    //     let search = _.get(context, 'root.$route.query.search', []);
    //     if (typeof search === 'string') search = [search];
    //
    //     const newItem = `${query.key}:${query.value}`;
    //
    //     if (checkUrlDuplicated(newItem, search)) {
    //         context.root.$router.push({ query: { search: [...search, newItem] } });
    //     }
    // };

    // addTag(val) {
    //     this.listTools.addTag(val);
    // }
    //
    // deleteAllTags() {
    //     this.listTools.deleteAllTags();
    // }
    //
    // deleteTag(idx) {
    //     this.listTools.deleteTag(idx);
    // }
}
// context.root.$router.push({ query: { search: props.searchText } });
