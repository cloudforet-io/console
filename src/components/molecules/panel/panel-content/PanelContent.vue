<template>
    <p-dl class="content-container">
        <template v-for="(def, idx) in defs">
            <div :key="idx" :class="{'content-list': !getFullLengthUsability(def), 'content-full-list': getFullLengthUsability(def)}">
                <slot name="details">
                    <span class="content">
                        <p-dt :class="{'label':true, 'label-common': !getFullLengthUsability(def), 'label-full': getFullLengthUsability(def)}">
                            {{ def.label }}
                        </p-dt>
                        <span class="data"
                              @mouseleave="mouseInOut(idx, false)"
                        >
                            <p-dd :ref="'dd-'+def.name"
                                  @mouseenter="mouseInOut(idx, true)"
                            >
                                <slot :name="`def-${def.name}-format`"
                                      :value="item[def.name] || ''"
                                      :item="item"
                                      :def="def"
                                >
                                    {{ item[def.name] || '' }}
                                </slot>
                            </p-dd>
                            <p-copy-button v-if="activeArr(idx, def) && isCopyFlagged(def)"
                                           class="copy-btn"
                                           :value="getValue(def.name)"
                            />
                        </span>
                    </span>
                </slot>
            </div>
        </template>
    </p-dl>
</template>

<script>
import _ from 'lodash';
import PDt from '@/components/atoms/lists/dl-list/Dt.vue';
import PDl from '@/components/atoms/lists/dl-list/Dl.vue';
import PDd from '@/components/atoms/lists/dl-list/Dd.vue';
import PCopyButton from '@/components/molecules/buttons/CopyButton.vue';

export default {
    name: 'PPanelContent',
    components: {
        PCopyButton,
        PDt,
        PDl,
        PDd,
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
        this.setActiveArray();
    },
    methods: {
        activeArr(idx, def) {
            return this.active[idx] && this.$refs[`dd-${def.name}`][0].innerText;
        },
        setActiveArray() {
            this.active = Array(this.defs.length).fill(false);
        },
        getFullLengthUsability(definition) {
            return (_.get(definition, 'full') === true);
        },
        isCopyFlagged(definition) {
            return (_.get(definition, 'copyFlag') === true);
        },
        mouseInOut(idx, flag) {
            this.$set(this.active, idx, flag);
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
            const ref = this.$refs[`dd-${name}`];
            return ref ? this.getTextContent(ref[0]).trim() : '';
        },
    },
};
</script>

<style lang="scss" scoped>
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
            float: left;
            overflow: hidden;
            clear: left;
            text-align: left;
            word-break: break-word;
            padding: 0 1rem;
            text-align: left;
            font-weight: bold;
            color: $gray1;
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
                top: -.3rem;
            }
        }
    }

</style>
