<template>
  <span class="state-tag d-flex justify-contents-center align-items-center">
    <span class="icon" :class="tag.color">
      <i :class="tag.icon" />
    </span> &nbsp; 
    <span class="text" :class="tag.color">
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
        }
    },
    computed: {
        tag () {
            let states = this.$root.ENUM[this.state.toUpperCase()];
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