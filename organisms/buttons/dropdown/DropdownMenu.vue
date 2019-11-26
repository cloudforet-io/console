<template>
    <div class="dropdown-menu" style="display: block;">
        <template v-for="(item, index) in menu">
            <a v-if="item.type==='item'" :key="index" class="dropdown-content dropdown-item"
               :disabled="item.disabled" @click.stop="menuClick(item.name, index, $event)"
            >
                {{ item.label }}
            </a>
            <div v-else-if="item.type==='divider'" :key="index" class="dropdown-divider"
                 @click.stop
            />
            <div v-else-if="item.type==='header'" :key="index" class="dropdown-content dropdown-title"
                 @click.stop
            >
                {{ item.label }}
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: 'PDropdownMenu',
    events: ['clickMenuEvent'],
    props: {
        menu: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        menuClick(eventName, index, event) {
            this.$emit(`click-${eventName}`, index, event);
            this.$emit('clickMenuEvent', eventName, index);
        },
    },
};
</script>

<style lang="scss" scoped>
    .dropdown-menu{
        background-color: $secondary2;
        border: 1px solid $secondary;
        padding: 0px;
        border-radius: 2px;
        margin: 0px;
        min-width: 8.5rem;
        cursor:default;
        top: 98%;
        .dropdown-divider{
            margin: 0;
            border-top:1px solid $secondary;
        }
        .dropdown-content{
            padding-left: 14px;
        }
        .dropdown-title{
            margin-top: 0.875rem;
            margin-bottom: 0.25rem;
            font: Bold 12px Arial;
            color: $dark;
        }
        .dropdown-item{
            color: $secondary !important;
            font: 14px/16px Arial;
            padding-bottom: 0.5rem;
            padding-top: 0.5rem;
            cursor:pointer;
            &:hover {
                background-color: $secondary;
                color: $white !important;
            }
            &:active{
                background-color: $secondary2;
                color: $secondary !important;
                font-weight: bold;
            }
        }
    }
</style>
