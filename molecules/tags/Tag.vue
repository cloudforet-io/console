<template>
    <p-badge class="p-tag" style-type="gray2" v-on="$listeners">
        <slot />
        <p-i v-if="deletable" name="ic_delete" width="1rem"
             height="1rem" class="icon"
             color="transparent inherit"
             @click="$emit('delete')"
        />
    </p-badge>
</template>

<script>
import _ from 'lodash';
import { ref, reactive } from '@vue/composition-api';
import PBadge from '@/components/atoms/badges/Badge.vue';
import PI from '@/components/atoms/icons/PI.vue';

/**
 * @description Generate tools for using tag badge as a list
 * @param proxyTags {Array<String>}
 * @param checkDuplicate {Boolean}
 * @returns {UnwrapRef<{deleteTag: *, tags: *, addTag: *}>}
 */
export const tagList = (proxyTags, checkDuplicate = true) => {
    const tags = proxyTags || ref([]);

    /**
     * @param idx {Number}
     */
    const deleteTag = (idx) => {
        const updatedTags = [...tags.value];
        updatedTags.splice(idx, 1);
        tags.value = updatedTags;
    };

    const validation = value => tags.value.every(tag => !_.isEqual(tag, value));

    /**
     * @param value {String}
     */
    const addTag = (value) => {
        const val = value.trim();
        if (!val || val === '') return;
        if (checkDuplicate && !validation(val)) return;
        const updatedTags = [...tags.value];
        updatedTags.push(val);
        tags.value = updatedTags;
    };

    return reactive({
        tags,
        deleteTag,
        addTag,
    });
};

export default {
    name: 'PTag',
    events: ['delete'],
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
};
</script>

<style lang="scss" scoped>
    .p-tag {
        margin-right: .5rem;
        vertical-align: middle;
        padding-right: 0.15rem;
        white-space: nowrap;
        .icon {
            color: $gray1;
            cursor: pointer;
        }
        &:hover {
            color: $gray2;
            background-color: $gray3;
            .icon {
                color: $alert;
            }

        }
    }
</style>
