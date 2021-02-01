<template>
    <p-modal :fade="fade"
             :size="size"
             :centered="centered"
             :backdrop="backdrop"
             :visible.sync="proxyVisible"
             :class="[`modal-${themeColor}`]"
    >
        <div class="modal-content">
            <div v-if="headerVisible" class="modal-header" :class="headerClass">
                <slot name="header" />
            </div>
            <div v-if="bodyVisible" class="modal-body-container" :class="allBodyClass">
                <div class="modal-body">
                    <slot name="body" />
                </div>
            </div>
            <div v-if="footerVisible" class="modal-footer" :class="footerClass">
                <slot name="footer" />
            </div>
        </div>
    </p-modal>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed,
} from '@vue/composition-api';
// @ts-ignore
import PModal from '@/feedbacks/modals/modal/PModal.vue';
import { makeProxy } from '@/util/composition-helpers';
import { sizeMapping } from '@/feedbacks/modals/modal/type';
import { ContentModalProps } from '@/feedbacks/modals/content-modal/type';


export default {
    name: 'PContentModal',
    components: { PModal },
    props: {
        fade: {
            type: Boolean,
            default: false,
        },
        scrollable: {
            type: Boolean,
            default: true,
        },
        size: {
            type: String,
            default: 'md',
            validator: value => Object.keys(sizeMapping).includes(value),
        },
        centered: {
            type: Boolean,
            default: false,
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
        visible: { // sync
            type: Boolean,
            default: false,
        },
        themeColor: {
            type: String,
            default: 'primary',
        },
        headerClass: {
            type: Array,
            default: null,
        },
        bodyClass: {
            type: Array,
            default: null,
        },
        footerClass: {
            type: Array,
            default: null,
        },
        headerVisible: {
            type: Boolean,
            default: true,
        },
        bodyVisible: {
            type: Boolean,
            default: true,
        },
        footerVisible: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: ContentModalProps, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
            allBodyClass: computed(() => {
                const res = props.bodyClass ? [...props.bodyClass] : [];
                if (props.size) res.push(props.size);
                if (props.scrollable) res.push('scrollable');
                return res;
            }),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.modal-content {
    @apply bg-white border border-gray-100;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
    border-radius: 2px;
    box-shadow: 0 0 1rem rgba(theme('colors.gray.100'), 0.22);
    transition: all 0.3s ease;
    justify-content: space-between;

    $header-height: 3.5rem;
    $footer-height: 5.5rem;
    $wrapper-margin: 4rem;
    $body-max-height: calc(100vh - $(header-height) - $(footer-height) - $(wrapper-margin));

    .modal-header {
        height: $header-height;
        padding: 0.875rem 1.5rem;
        font-size: 1.375rem;
    }
    .modal-body-container {
        flex-grow: 1;
        max-height: $body-max-height;
        overflow: hidden;
        &.scrollable {
            overflow: auto;
            min-height: 30rem;
        }
        .modal-body {
            margin: 2rem 1.5rem;
        }
    }
    .modal-footer {
        height: $footer-height;
        padding: 1.5rem;
        border: none;
    }
}

@define-mixin modal-color $color {
    .modal-header {
        border-bottom: 2px solid $color;
        color: $color;
    }
}

.modal-primary { @mixin modal-color theme('colors.primary'); }
.modal-primary-dark { @mixin modal-color theme('colors.primary-dark'); }
.modal-primary1 { @mixin modal-color theme('colors.primary1'); }
.modal-primary2 { @mixin modal-color theme('colors.primary2'); }
.modal-secondary { @mixin modal-color theme('colors.secondary'); }
.modal-secondary1 { @mixin modal-color theme('colors.secondary1'); }
.modal-safe { @mixin modal-color theme('colors.safe'); }
.modal-alert { @mixin modal-color theme('colors.alert'); }
.modal-gray900 { @mixin modal-color theme('colors.gray.900'); }
.modal-gray { @mixin modal-color theme('colors.gray.default'); }
</style>
