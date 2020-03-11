<template>
    <p-badge class="p-tag" :class="{deletable: deletable}"
             style-type="gray2" v-on="$listeners"
    >
        <slot />
        <p-i v-if="deletable" name="ic_delete" width="1rem"
             height="1rem" class="icon"
             color="transparent inherit"
             @click="$emit('delete')"
        />
    </p-badge>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    ref, reactive, Ref, defineComponent,
} from '@vue/composition-api';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PI from '@/components/atoms/icons/PI.vue';

/**
 * @description Generate tools for using tag badge as a list
 * @param proxyTags {Array<String>}
 * @param checkDuplicate {Boolean}
 * @param eventBus {EventBus}
 * @param eventName {string}
 * @returns {UnwrapRef<{deleteTag: *, tags: *, addTag: *}>}
 */
export const tagList = (proxyTags:Ref<string[]>|null|undefined, checkDuplicate:boolean = true, eventBus?:any, eventName?:string, addTagCallBack?:any) => {
    const tags:Ref<any[]> = proxyTags || ref([]);
    if (!tags.value) tags.value = [];

    /**
     * @param idx {Number}
     */
    const deleteTag = (idx:number) => {
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

export default defineComponent({
    name: 'PTag',
    components: {
        PBadge,
        PI,
    },
    props: {
        deletable: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        return { };
    },
});
</script>

<style lang="postcss" scoped>
    .p-tag {
        margin-right: .5rem;
        vertical-align: middle;
        white-space: nowrap;
        color: inherit;
        &.deletable {
            padding-right: 0.15rem;
            .icon {
                @apply text-gray1;
                cursor: pointer;
            }
            &:hover {
                @apply bg-gray3;
                .icon {
                    @apply text-alert;
                }
            }
        }
    }
</style>
