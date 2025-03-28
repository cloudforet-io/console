<template>
    <section class="p-button-modal">
        <transition v-if="visible"
                    name="modal"
                    @after-leave="onModalLeave"
        >
            <div class="modal-mask"
                 :class="{
                     'no-backdrop':!backdrop,
                     'absolute': !!absolute,
                     'loading-backdrop': loadingBackdrop
                 }"
                 :style="absolute ? {'top': `${absolute}rem`, 'left': `${absolute}rem`} : {}"
            >
                <p-spinner v-if="loadingBackdrop"
                           size="xl"
                           style-type="white"
                />
                <div v-if="!loadingBackdrop"
                     class="modal-wrapper"
                     :class="dialogClassObject"
                     role="dialog"
                     aria-modal="true"
                     aria-labelledby="headerTitle"
                     tabindex="1"
                >
                    <article class="modal-content"
                             :class="[`modal-${themeColor}`, {'no-footer': hideFooter}]"
                             :style="absolute ? {maxHeight: `calc(100vh - 4rem - ${absolute}rem`} : {}"
                    >
                        <h3 class="header">
                            <slot v-if="!hideHeader"
                                  name="header"
                            >
                                <span class="modal-header"
                                      :class="[`${themeColor}-header`]"
                                >
                                    <p-i name="ic_error-filled"
                                         :class="[`modal-${themeColor}`]"
                                         class="header-img"
                                         color="inherit transparent"
                                    />
                                    <span class="header-title"><slot name="header-title">{{ headerTitle }}</slot></span>
                                </span>
                            </slot>
                            <p-icon-button v-if="!hideHeaderCloseButton"
                                           name="ic_close"
                                           color="inherit"
                                           class="close-button"
                                           :class="[{disabled: loading},
                                                    {'no-footer': hideFooter}]"
                                           @click.stop="onCloseClick"
                            />
                        </h3>
                        <div v-if="!hideBody"
                             :id="modalBodyId"
                             class="modal-body"
                             :class="allBodyClass"
                        >
                            <slot name="body" />
                        </div>
                        <div v-if="!hideFooter"
                             class="modal-footer"
                        >
                            <slot :slot-scope="$props"
                                  name="footer-extra"
                            />
                            <p-button
                                v-if="footerResetButtonVisible"
                                class="modal-button reset-button"
                                style-type="tertiary"
                                :disabled="loading"
                                @click="onResetClick"
                            >
                                <slot :slot-scope="$props"
                                      name="reset-button"
                                >
                                    Reset
                                </slot>
                            </p-button>
                            <p-button v-if="!hideFooterCloseButton"
                                      class="modal-button cancel-button"
                                      style-type="transparent"
                                      :disabled="loading"
                                      @click="onCancelClick"
                            >
                                <slot name="close-button"
                                      v-bind="$props"
                                >
                                    {{ $t('COMPONENT.BUTTON_MODAL.CANCEL') }}
                                </slot>
                            </p-button>
                            <p-button
                                v-if="!hideFooterConfirmButton"
                                class="modal-button confirm-button"
                                :class="{'no-cancel-button': hideFooterCloseButton}"
                                :style-type="buttonThemeColor"
                                :loading="loading"
                                :disabled="disabled"
                                @click="onConfirmClick"
                            >
                                <slot name="confirm-button"
                                      v-bind="$props"
                                >
                                    {{ $t('COMPONENT.BUTTON_MODAL.CONFIRM') }}
                                </slot>
                            </p-button>
                        </div>
                    </article>
                </div>
            </div>
        </transition>
    </section>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import type { TranslateResult } from 'vue-i18n';

import PButton from '@/controls/buttons/button/PButton.vue';
import { BUTTON_STYLE } from '@/controls/buttons/button/type';
import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import type { ModalThemeColor } from '@/feedbacks/modals/button-modal/type';
import type { ModalSizeType } from '@/feedbacks/modals/type';
import '@/feedbacks/modals/modal.pcss';
import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';



export default defineComponent({
    name: 'PButtonModal',
    components: {
        PSpinner,
        PI,
        PIconButton,
        PButton,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        size: {
            type: String as PropType<ModalSizeType>,
            default: 'md',
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
        absolute: {
            type: Number,
            default: undefined,
        },
        themeColor: {
            type: String as PropType<ModalThemeColor>,
            default: 'primary',
        },
        headerTitle: {
            type: String as PropType<string|TranslateResult>,
            default: '',
        },
        hideHeader: {
            type: Boolean,
            default: false,
        },
        hideBody: {
            type: Boolean,
            default: false,
        },
        hideFooter: {
            type: Boolean,
            default: false,
        },
        hideHeaderCloseButton: {
            type: Boolean,
            default: false,
        },
        hideFooterCloseButton: {
            type: Boolean,
            default: false,
        },
        hideFooterConfirmButton: {
            type: Boolean,
            default: false,
        },
        footerResetButtonVisible: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        modalBodyId: {
            type: String,
            default: undefined,
        },
        loadingBackdrop: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            allBodyClass: computed(() => {
                const res: string[] = [];
                if (props.size) res.push(props.size);
                return res;
            }),
            buttonThemeColor: computed(() => {
                if (props.themeColor === 'primary1') return BUTTON_STYLE.substitutive;
                if (props.themeColor === 'gray900') return BUTTON_STYLE.tertiary;
                if (props.themeColor === 'secondary') return BUTTON_STYLE.highlight;
                if (props.themeColor === 'safe') return BUTTON_STYLE.positive;
                if (props.themeColor === 'alert') return BUTTON_STYLE['negative-primary'];
                if (['primary2', 'secondary1'].includes(props.themeColor)) return BUTTON_STYLE.secondary;
                return BUTTON_STYLE.primary;
            }),
        });
        const dialogClassObject = computed(() => [
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
        };
        const onCancelClick = () => {
            if (props.loading) return;
            emit('cancel');
            state.proxyVisible = false;
        };
        const onConfirmClick = () => {
            emit('confirm');
        };
        const onModalLeave = () => {
            emit('closed');
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
            onModalLeave,
        };
    },
});

</script>
<style lang="postcss">
.p-button-modal {
    .modal-content {
        @apply bg-white border border-gray-200 rounded-lg;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: calc(100vh - 6rem);
        pointer-events: auto;
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
                @apply text-display-sm;
                display: flex;
                align-items: flex-start;
                min-height: $header-height;
                margin-bottom: 0.375rem;
                word-break: break-word;

                &.alert-header {
                    @apply relative;
                    text-indent: 2rem;
                    .modal-alert {
                        @apply text-red-400;
                    }

                    @screen mobile {
                        .header-title {
                            text-indent: 2rem;
                        }
                    }
                }
            }

            .header-img {
                display: none;

                &.modal-alert {
                    display: block;
                    position: absolute;
                }
            }

            .close-button {
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
            flex-grow: 1;
            max-height: $body-max-height;
            min-height: 1.25rem;
            overflow: auto;
            line-height: normal;
        }

        .modal-footer {
            display: flex;
            align-items: center;
            width: 100%;
            padding-top: 1.5rem;
            border: none;

            .modal-button {
                @apply rounded;
                height: 2.5rem;
                font-size: 1rem;
            }

            .cancel-button {
                margin-left: auto;
                margin-right: 1rem;
            }

            .reset-button {
                display: none;

                @screen xs {
                    display: flex;
                }
            }

            .confirm-button.no-cancel-button {
                margin-left: auto;
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
.modal-primary2 { @mixin modal-color theme('colors.primary'); }
.modal-secondary { @mixin modal-color theme('colors.secondary'); }
.modal-secondary1 { @mixin modal-color theme('colors.primary'); }
.modal-safe { @mixin modal-color theme('colors.gray.900'); }
.modal-alert { @mixin modal-color theme('colors.alert'); }
.modal-gray900 { @mixin modal-color theme('colors.gray.900'); }

@screen mobile {
    .modal-mask {
        &.absolute {
            left: 0.75rem !important;
        }
    }
}

</style>
