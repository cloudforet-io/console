import {
    computed,
    isRef, ref, Ref,
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
