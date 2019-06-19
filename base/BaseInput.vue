<template>
  <input v-model="value" v-focus="isValueFocused" class="pl-2 value-input"
         autocomplete="off" type="text" placeholder="Search" @focus="isValueFocused = true"
         @blur="isValueFocused = false" @input="onValueInput" @keyup.enter="onEnterKey"
         @keydown.delete="onDeleteKey" @keydown.up="onUpKey" @keydown.down="onDownKey"
  >
</template>

<script>
import { focus } from 'vue-focus'
export default {
  name: 'BaseInput',
  directives: { focus: focus },
  props: {
    value: {
      type: String,
      required: true
    }
  },
  computed: {

  }
}
</script>

<style lang="scss" scoped>

</style>
