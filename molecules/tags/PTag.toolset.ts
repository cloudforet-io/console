import {
    computed,
    isRef, reactive, ref, Ref,
} from '@vue/composition-api';
import { isEqual } from 'lodash';

export type ChangeTagCallBack<T=any> = (tags: T[]) => void;
export class TagToolSet<T=any> {
    constructor(
        public tags: Ref<T[]> = ref([]),
        public checkDuplicate: boolean = true,
        public changeTagCallBack?: ChangeTagCallBack<T>,
    ) { }

    setTags = (tags: T[]): void => {
        this.tags.value = tags;
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

    validation = (value: T): boolean => this.tags.value.every(tag => !isEqual(tag, value));

     addTag = (value: T) => {
         let val: T = value;
         if (typeof value === 'string') val = value.trim() as unknown as T;
         if (!val) return;
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

    const validation = value => tags.value.every(tag => !isEqual(tag, value));

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
