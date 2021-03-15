<template>
    <section class="p-button-modal">
        <transition v-if="visible" name="modal">
            <div class="modal-mask" :class="{'no-backdrop':!backdrop}">
                <div class="modal-wrapper" :class="dialogClassObject"
                     role="dialog"
                     aria-modal="true"
                     aria-labelledby="headerTitle"
                     tabindex="1"
                     @keydown.esc="onCloseClick"
                >
                    <article class="modal-content" :class="[`modal-${themeColor}`, {'no-footer': !footerVisible}]">
                        <h3 class="header">
                            <div v-if="headerVisible" class="modal-header" :class="headerClass">
                                <p-lottie name="lottie_error" auto :size="1.5"
                                          :class="[`modal-${themeColor}`]" class="header-lottie"
                                />{{ headerTitle }}
                            </div>
                            <p-icon-button v-if="headerCloseButtonVisible"
                                           name="ic_delete" color="transparent inherit"
                                           class="close-btn"
                                           :class="[{disabled: loading},
                                                    {'no-footer': !footerVisible}]"
                                           @click.stop="onCloseClick"
                            />
                        </h3>
                        <div v-if="bodyVisible" class="modal-body" :class="allBodyClass">
                            <slot name="body" />
                        </div>
                        <div v-if="footerVisible" class="modal-footer" :class="footerClass">
                            <slot :slot-scope="$props" name="footer-extra" />
                            <p-button
                                v-if="footerResetButtonVisible"
                                class="modal-btn reset-btn"
                                style-type="gray-border"
                                :disabled="loading"
                                @click="onResetClick"
                            >
                                <slot :slot-scope="$props" name="reset-button">
                                    Reset
                                </slot>
                            </p-button>
                            <p-button
                                v-if="footerCancelButtonVisible"
                                class="modal-btn cancel-btn"
                                style-type="transparent"
                                :disabled="loading"
                                @click="onCancelClick"
                            >
                                <slot :slot-scope="$props" name="close-button">
                                    {{ $t('COMPONENT.BUTTON_MODAL.CANCEL') }}
                                </slot>
                            </p-button>
                            <p-loading-button v-if="footerConfirmButtonVisible"
                                              class="modal-btn"
                                              :style-type="themeColor"
                                              :loading="loading"
                                              :disabled="disabled"
                                              @click="onConfirmClick"
                            >
                                <slot :slot-scope="$props" name="confirm-button">
                                    {{ $t('COMPONENT.BUTTON_MODAL.CONFIRM') }}
                                </slot>
                            </p-loading-button>
                        </div>
                    </article>
                </div>
            </div>
        </transition>
    </section>
</template>

<script lang="ts">
import PLoadingButton from '@/others/deprecated/loading-button/PLoadingButton.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import { sizeMapping } from '@/feedbacks/modals/type';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/util/composition-helpers';
import { ButtonModalProps } from '@/feedbacks/modals/button-modal/type';
import '../modal.pcss';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';


export default {
    name: 'PButtonModal',
    components: {
        PIconButton,
        PLottie,
        PButton,
        PLoadingButton,
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        fade: {
            type: Boolean,
            default: false,
        },
        scrollable: {
            type: Boolean,
            default: false,
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
        headerTitle: {
            type: String,
            default: '',
        },
        headerCloseButtonVisible: {
            type: Boolean,
            default: true,
        },
        footerCancelButtonVisible: {
            type: Boolean,
            default: true,
        },
        footerConfirmButtonVisible: {
            type: Boolean,
            default: true,
        },
        footerResetButtonVisible: {
            type: Boolean,
            default: false,
        },
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: ButtonModalProps, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            allBodyClass: computed(() => {
                const res = props.bodyClass ? [...props.bodyClass] : [];
                if (props.size) res.push(props.size);
                if (props.scrollable) res.push('scrollable');
                return res;
            }),
        });
        const dialogClassObject = computed(() => [
            { scrollable: props.scrollable },
            { centered: props.centered },
            props.size,
        ]);
        const hide = () => {
            if (props.visible) { emit('update:visible', false); }
        };
        const show = () => {
            if (!props.visible) { emit('update:visible', true); }
        };
        const toggle = () => {
            emit('update:visible', !props.visible);
        };
        const onCloseClick = () => {
            if (props.loading) return;
            emit('close');
            state.proxyVisible = false;
        };
        const onResetClick = () => {
            if (props.loading) return;
            emit('return');
            state.proxyVisible = false;
        };
        const onCancelClick = () => {
            if (props.loading) return;
            emit('cancel');
            if (props.hideOnCancel) {
                state.proxyVisible = false;
            }
        };
        const onConfirmClick = () => {
            emit('confirm');
        };
        return {
            ...toRefs(state),
            dialogClassObject,
            show,
            hide,
            toggle,
            onResetClick,
            onCloseClick,
            onCancelClick,
            onConfirmClick,
        };
    },
};

</script>
<style lang="postcss">
.p-button-modal {
    .modal-content {
        @apply bg-white border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: calc(100vh - 4rem);
        pointer-events: auto;
        border-radius: 0.375rem;
        box-shadow: 0 0 0.5rem rgba(theme('colors.gray.900'), 0.32);
        transition: all 0.3s ease;
        justify-content: space-between;
        padding: 2rem 2rem;

        &.no-footer {
            padding-bottom: 2.5rem;
        }

        $header-height: 3.5rem;
        $footer-height: 96px;
        $wrapper-margin: 4rem;
        $body-max-height: calc(100vh - $(header-height) - $(footer-height) - $(wrapper-margin));

        .header {
            display: flex;
            justify-content: space-between;

            .modal-header {
                height: $header-height;
                font-size: 1.375rem;
                line-height: 145%;
            }

            .header-lottie {
                display: none;

                &.modal-alert {
                    display: inline-flex;
                    margin-right: 0.5rem;
                }
            }

            .close-btn {
                @apply text-gray-400;
                cursor: pointer;

                &:hover {
                    @apply text-secondary;
                }

                &.disabled {
                    @apply text-gray-200;
                }

                &.no-footer {
                    @apply text-gray-900;
                }
            }
        }

        .modal-body {
            @apply text-gray-600;
            flex-grow: 1;
            max-height: $body-max-height;
            overflow: auto;
        }

        .modal-footer {
            display: flex;
            align-items: center;
            width: 100%;
            padding-top: 1.5rem;
            border: none;

            .modal-btn {
                height: 2.5rem;
                font-size: 1rem;
            }

            .cancel-btn {
                margin-left: auto;
                margin-right: 1rem;
            }

            .reset-btn {
                display: none;

                @screen xs {
                    display: flex;
                }
            }
        }
    }
}

@define-mixin modal-color $color {
    .modal-header {
        color: $color;
    }
}

.modal-primary { @mixin modal-color theme('colors.primary'); }
.modal-primary-dark { @mixin modal-color theme('colors.primary-dark'); }
.modal-primary1 { @mixin modal-color theme('colors.primary1'); }
.modal-primary2 { @mixin modal-color theme('colors.primary2'); }
.modal-secondary { @mixin modal-color theme('colors.secondary'); }
.modal-secondary1 { @mixin modal-color theme('colors.secondary1'); }
.modal-safe { @mixin modal-color theme('colors.gray.900'); }
.modal-alert { @mixin modal-color theme('colors.alert'); }
.modal-gray900 { @mixin modal-color theme('colors.gray.900'); }
.modal-gray { @mixin modal-color theme('colors.gray.default'); }

</style>
