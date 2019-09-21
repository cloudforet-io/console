<template>
  <span class="badge"
        :class="{inline: inline, [tag.color]: tag.color}"
  >
    {{ tag.msg }}
  </span>
</template>

<script>
const tagModel = {
    msg: '',
    color: ''
};
export default {
    name: 'BaseBadgeTag',
    props: {
        enumKey: {
            type: String,
            required: true
        },
        data: {
            type: String,
            required: true
        },
        inherit: {
            type: Boolean,
            default: false
        },
        inline: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        tag () {
            let keys = this.$root.enums[this.enumKey.toUpperCase()];
            if (this.isEmpty(keys)) {
                throw new Error('Wrong property value. \'enumKey\' property must be one of the GLOBAL ENUM.');
            }
            
            let keyObj = keys[this.data.toUpperCase()];
            if (this.isEmpty(keyObj)) {
                throw new Error('Wrong property. \'enumKey\' property must be an Object which has msg, and color properties.');
            }

            return keyObj;
        }
    }
};
</script>

<style lang="scss" scoped>
@mixin badge-color($color) {
    background-color: $color;
    border-color: $color;
}
.badge {
    padding: 4px 7px 3px 7px;
    font-size: 1rem;
    text-transform: uppercase;
    font-weight: 700;
    color: $white;
    &.primary { @include badge-color($primary); }
    &.secondary { @include badge-color($primary); }
    &.danger { @include badge-color($danger); }
    &.dark { @include badge-color($dark); }
    &.info { @include badge-color($info); }
    &.warning { @include badge-color($warning); }
    &.light { @include badge-color($light); }
    &.success { @include badge-color($success); }
}


</style>