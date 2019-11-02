<template>
    <transition name="fade-in">
        <div
            v-if="value"
            class="p-menu-list"
        >
            <p-list-item
                v-for="(item, idx) in listItems"
                :key="idx"
                :contents="item.contents"
                :indent="item.indent"
            />
        </div>
    </transition>
</template>

<script>
import ListItem from '@/components/molecules/list-items/ListItem';
import { LIST_ITEM_PROPERTIES } from './MenuList.map';

export default {
    name: 'PMenuList',
    events: ['change', 'show', 'hide'],
    components: { PListItem: ListItem },
    model: {
        prop: 'value',
        event: 'change',
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        listItems: {
            type: Array,
            default: () => ([]),
            validator(listItems) {
                return listItems.every((listItem) => {
                    const keys = Object.keys(listItem);
                    return keys.every(key => LIST_ITEM_PROPERTIES.includes(key));
                });
            },
        },
    },
    watch: {
        value(val) {
            this.$emit('change', val);
            if (val) {
                this.$emit('show');
            } else {
                this.$emit('hide');
            }
        },
    },
    methods: {
        show() {
            this.value = true;
        },
        hide() {
            this.value = false;
        },
        test() {
            console.log('test')
        }
    },
};
</script>

<style lang="scss" scoped>
.p-menu-list {
    &.fade-in-enter-active {
        transition: opacity .15s, visibility .15s;
    }
    &.fade-in-leave-active {
        transition: opacity .15s, visibility .15s;
    }
    &.fade-in-enter, &.fade-in-leave-to {
        visibility: hidden;
        opacity: 0;
    }
    .fade-in-leave, &.fade-in-enter-to {
        visibility: visible;
        opacity: 1;
    }
}
</style>
