<template>
    <div class="p-context-menu" style="display: block;" :class="theme">
        <template v-for="(item, index) in menu">
            <a v-if="item.type==='item'" :id="`context-item-${index}`" :key="index"
               :tabindex="index"
               class="context-content context-item no-drag"
               :class="[{disabled:item.disabled},theme]"
               @click.stop="menuClick(item.name, index, $event)"
               @keyup.up="onUpKey(index)"
               @keyup.down="onDownKey(index)"
               @keyup.enter="menuClick(item.name, index, $event)"
            >
                {{ item.label }}
            </a>
            <div v-else-if="item.type==='divider'" :key="index" class="context-divider"
                 @click.stop
            />
            <div v-else-if="item.type==='header'" :key="index" class="context-content context-header no-drag"
                 :class="theme"
                 @click.stop
            >
                {{ item.label }}
            </div>
        </template>
    </div>
</template>

<script>
import { computed } from '@vue/composition-api';

export default {
    name: 'PContextMenu',
    events: ['clickMenuEvent'],
    props: {
        menu: {
            type: [Array, Object],
            default: () => [],
        },
        theme: {
            type: String,
            default: 'secondary',
        },
    },
    setup(props, context) {
        const menuClick = (eventName, index, event) => {
            if (!props.menu[index].disabled) {
                context.emit(`click-${eventName}`, index, event);
                context.emit('clickMenuEvent', eventName, index);
            }
        };
        const itemsIndex = computed(() => {
            const idxs = [];
            for (let i = 0; i < Object.keys(props.menu).length; i++) {
                if (props.menu[i].type === 'item') idxs.push(i);
            }
            return idxs;
        });
        const focus = (idx) => {
            const pos = idx || itemsIndex.value[0];
            document.getElementById(`context-item-${itemsIndex.value[pos]}`).focus();
        };
        const onUpKey = (idx) => {
            const pos = itemsIndex.value.indexOf(idx);
            if (pos !== 0) { focus(pos - 1); }
        };
        const onDownKey = (idx) => {
            const pos = itemsIndex.value.indexOf(idx) + 1;
            if (pos !== itemsIndex.value.length) { focus(pos); }
        };
        return {
            menuClick, onDownKey, onUpKey, focus,
        };
    },
};
</script>

<style lang="scss" scoped>

    @mixin context-item-them($theme,$color,$hover-bg-color,$hover-color,$active-bg-color,$active-color,$disabled-color){
        &.#{$theme}{
            color: $color;
            &:hover {
                background-color: $hover-bg-color;
                color: $hover-color !important;
            }
            &:focus {
                background-color: $hover-bg-color;
                color: $hover-color !important;
            }
            &:active{
                background-color: $active-bg-color;
                color: $active-color !important;
            }
            &.disabled{
                color: $disabled-color !important;
            }
        }
    }

    @mixin context-header-theme($theme,$color){
        &.#{$theme} {
            color: $color;
        }
    }

    @mixin context-menu-color($theme,$bg-color, $border-color) {
        &.#{$theme} {
            background-color: $bg-color;
            border: 1px solid $border-color;
            .context-divider{
                border-top-color: $border-color;
            }
        }
    }
    .no-drag {-ms-user-select: none; -moz-user-select: none; -webkit-user-select: none; -khtml-user-select: none; user-select:none;}

    .p-context-menu{
        padding: 0px;
        border-radius: 2px;
        margin: 0px;
        min-width: 8.5rem;
        cursor:default;
        position: absolute;
        top: 94%;
        left: 0;
        z-index: 1000;
        float: left;
        text-align: left;
        list-style: none;
        background-clip: padding-box;

        .context-divider{
            margin: 0;
            border-top-width: 1px;
            border-top-style: solid;
        }
        @include context-menu-color('secondary',$secondary2,$secondary);
        @include context-menu-color('dark',$white,$dark);

        .context-content{
            padding-left: 14px;
        }
        .context-header{
            margin-top: 0.875rem;
            margin-bottom: 0.25rem;
            font: Bold 12px Arial;
            @include context-header-theme('secondary',$dark);
            @include context-header-theme('dark',$gray1);
        }
        .context-item{
            display: block;
            font: 14px/16px Arial;
            padding-bottom: 0.5rem;
            padding-top: 0.5rem;
            cursor:pointer;
            &:active{
                font-weight: bold;
            }
            @include context-item-them('secondary',$secondary,$secondary,$white, $secondary2,$secondary, $gray2);
            @include context-item-them('dark',$dark,$gray3,$dark, $white,$dark, $gray2);
        }

    }
</style>
