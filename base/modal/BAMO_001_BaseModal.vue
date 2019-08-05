<template>
  <span>
    <span @click="showModal">
      <slot name="activator" />
    </span>

    <b-modal :ref="name"
             :title="title"
             :centered="centered"
             :no-close-on-backdrop="backdropOff"
             :hide-footer="hideFooter"
             :size="size"
             @ok="$emit('ok')"
             @hidden="$store.dispatch('modal/modalHidden')"
    >
      <slot v-if="isModalShown" name="contents" :hide="hideModal" :show="showModal" />
      <template v-slot:modal-footer>
        <slot name="footer" />
      </template>
    </b-modal>
  </span>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'BaseModal',
    event: ['ok'],
    props: {
        name: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: null
        },
        centered: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'lg'
        },
        backdropOff: {
            type: Boolean,
            default: false
        },
        hideFooter: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters('modal', [
            'isModalShown',
            'openState'
        ])
    },
    watch: {
        openState (v) {
            if (!v) {
                this.$refs[this.name].hide();
            }
        }
    },
    methods: {
        showModal (e) {
            this.$store.dispatch('modal/openModal');
            this.$refs[this.name].show();
        },
        hideModal (e) {
            this.$store.dispatch('modal/closeModal');
            this.$refs[this.name].hide();
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
