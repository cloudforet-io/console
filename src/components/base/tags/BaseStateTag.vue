<template>
  <span class="state-tag justify-contents-center align-items-center"
        :class="inline ? 'd-inline' : 'd-flex'"
  >
    <span :class="{icon: !inherit,
                   [tag.color]: !inherit}"
    >
      <i :class="tag.icon" />
    </span> &nbsp; 
    <span :class="{text: !inherit,
                   [tag.color]: !inherit,
                   'align-bottom': inline
    }"
    >
      {{ tag.msg }}
    </span>
  </span>
</template>

<script>
const tagModel = {
    msg: '',
    color: '',
    icon: ''
};
export default {
    name: 'BaseStateTag',
    props: {
        state: {
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
            let states = this.$root.enums[this.state.toUpperCase()];
            if (this.isEmpty(states)) {
                throw new Error('Wrong property value. \'state\' property must be one of the GLOBAL ENUM.');
            }
            
            let stateObj = states[this.data.toUpperCase()];
            if (this.isEmpty(stateObj)) {
                throw new Error('Wrong property. \'state\' property must be an Object which has msg, color, and icon properties.');
            }

            return stateObj;
        }
    }
};
</script>

<style lang="scss" scoped>
.icon {
    vertical-align: middle;
    text-align: center;
    width: 20px;
}
.text {
    vertical-align: middle;
    padding-left: 5px;
    padding-right: 5px;
    font-size: 0.9em;
    font-weight: 600;
}
</style>