<template>
    <dl class="content-container">
        <template v-for="(def, idx) in defs">
            <div :key="idx" :class="{'content-list': !getFullLengthUsability(def), 'content-full-list': getFullLengthUsability(def)}">
                <slot name="details">
                    <span class="content">
                        <dt :class="{'label':true, 'label-common': !getFullLengthUsability(def), 'label-full': getFullLengthUsability(def)}">
                            {{ def.label }}
                        </dt>
                        <span class="data"
                              @mouseleave="mouseInOut(idx, false)"
                        >
                            <dd :ref="'dd-'+def.name"
                                @mouseenter="mouseInOut(idx, true)"
                            >
                                <slot :name="`def-${def.name}-format`"
                                      :value="item[def.name] || ''"
                                      :item="item"
                                      :def="def"
                                >
                                    {{ item[def.name] || '' }}
                                </slot>
                            </dd>
                            <p-copy-button v-if="activeArr(idx, def) && isCopyFlagged(def)"
                                           class="copy-btn"
                                           :value="getValue(def.name)"
                            />
                        </span>
                    </span>
                </slot>
            </div>
        </template>
    </dl>
</template>

<script lang="ts">
import { get } from 'lodash';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';

export default {
    name: 'PPanelContent',
    components: {
        PCopyButton,
    },
    props: {
        defs: {
            type: Array,
            default: () => [],
        },
        item: {
            type: Object,
            default: () => ({}),
        },
        fullWidth: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            active: null,
            parseItem: false,
        };
    },
    created() {
        (this as any).setActiveArray();
    },
    methods: {
        activeArr(idx, def) {
            return (this as any).active[idx] && (this as any).$refs[`dd-${def.name}`][0].innerText;
        },
        setActiveArray() {
            (this as any).active = Array((this as any).defs.length).fill(false);
        },
        getFullLengthUsability(definition) {
            return (get(definition, 'full') === true);
        },
        isCopyFlagged(definition) {
            return (get(definition, 'copyFlag') === true);
        },
        mouseInOut(idx, flag) {
            (this as any).$set((this as any).active, idx, flag);
        },
        getTextContent(el, text = '') {
            if (el.childElementCount === 0) {
                if (text && el.textContent) return `${text}, ${el.textContent}`;
                return text || el.textContent;
            }
            if (el.childElementCount > 1) {
                let res = '';
                el.children.forEach((child) => {
                    res += this.getTextContent(child, res);
                });
                return res;
            }
            return this.getTextContent(el.firstElementChild);
        },
        getValue(name) {
            const ref = (this as any).$refs[`dd-${name}`];
            return ref ? this.getTextContent(ref[0]).trim() : '';
        },
    },
};
</script>

<style lang="postcss" scoped>
    .content-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        width: 100%;
        .content-list {
            flex-basis: 50%;
            max-width: 50%;
        }
        .content-full-list {
            flex-basis: 100%;
            max-width: 100%;
        }
    }
    .content {
        display: flex;
        align-items: center;
        padding-bottom: 1rem;
        .label {
            @apply text-gray-400;
            float: left;
            clear: left;
            text-align: left;
            word-break: break-word;
            padding: 0 1rem;
            font-weight: bold;
            min-width: 10rem;
        }
        .label-common {
            width: 25%;
        }
        .label-full {
            width: 12.5%;
        }

        .data {
            flex: 1;
            display: flex;
            align-items: center;
            text-align: left;
            color: #222532;
            opacity: 1;
            dd {
                margin: 0;
            }
        }
        .copy-btn::v-deep {
            flex: 1;
            height: 1rem;
            .p-copy-btn {
                top: -0.3rem;
            }
        }
    }

</style>
