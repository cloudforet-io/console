import {
    computed,
    isRef, reactive, ref, Ref,
} from '@vue/composition-api';
import _ from 'lodash';

export class TagToolSet {
    constructor(
        public tags: Ref<any[]> = ref([]),
        public checkDuplicate: boolean = true,
        public eventBus?: any,
        public eventName?: string,
        public changeTagCallBack?: any,
    ) { }

    setTags = (tags: any[]): void => {
        this.tags.value = tags;
        if (this.eventBus && this.eventName) { this.eventBus.$emit(this.eventName, this.tags.value); }
        if (this.changeTagCallBack) { this.changeTagCallBack(this.tags.value); }
    };

    deleteTag = (idx: number) => {
        const updatedTags = [...this.tags.value];
        updatedTags.splice(idx, 1);
        this.setTags(updatedTags);
    };

    deleteAllTags = () => {
        this.setTags([]);
    };

    validation = value => this.tags.value.every(tag => !_.isEqual(tag, value));

     addTag = (value) => {
         const val = (typeof value === 'string') ? value.trim() : value;
         if (!val || val === '') return;
         if (this.checkDuplicate && !this.validation(val)) return;
         this.setTags([...this.tags.value, val]);
     };
}


/**
 * @description Generate tools for using tag badge as a list
 * @param proxyTags {Array<String>}
 * @param checkDuplicate {Boolean}
 * @param eventBus {EventBus}
 * @param eventName {string}
 * @returns {UnwrapRef<{deleteTag: *, tags: *, addTag: *}>}
 */
export const tagList = (proxyTags?: Ref<string[]>|null, checkDuplicate = true, eventBus?: any, eventName?: string, addTagCallBack?: any) => {
    const tags: Ref<any[]> = proxyTags || ref([]);
    if (!tags.value) tags.value = [];

    /**
     * @param idx {Number}
     */
    const deleteTag = (idx: number) => {
        const updatedTags = [...tags.value];
        updatedTags.splice(idx, 1);
        tags.value = updatedTags;
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    const deleteAllTags = () => {
        tags.value = [];
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    const validation = value => tags.value.every(tag => !_.isEqual(tag, value));

    /**
     * @param value {String}
     */
    const addTag = (value) => {
        const val = (typeof value === 'string') ? value.trim() : value;
        if (!val || val === '') return;
        if (checkDuplicate && !validation(val)) return;
        const updatedTags = [...tags.value];
        updatedTags.push(val);
        tags.value = updatedTags;
        if (eventBus) { eventBus.$emit(eventName, tags.value); }
        if (addTagCallBack) { addTagCallBack(tags.value); }
    };

    return reactive({
        tags,
        deleteTag,
        addTag,
        deleteAllTags,
    });
};
