<template>
    <p-dl class="content-container">
        <div v-for="(def, idx) in defs" :key="idx" class="content-list">
            <slot name="details">
                <span class="content">
                    <p-dt class="label">
                        {{ def.label }}
                    </p-dt>
                    <span class="data"
                          @mouseleave="mouseInOut(idx, false)"
                    >
                        <p-dd :ref="'dd-'+def.name"
                              @mouseenter="mouseInOut(idx, true)"
                        >
                            <slot :name="`def-${def.name}-format`"
                                  :value="getValue(def.name)"
                                  :item="item"
                                  :def="def"
                            >
                                {{ getValue(def.name) }}
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
    </p-dl>
</template>

<script>
import _ from 'lodash';
import PDt from '@/components/atoms/definition/dt/Dt';
import PDl from '@/components/atoms/definition/dl/Dl';
import PDd from '@/components/atoms/definition/dd/Dd';
import PCopyButton from '@/components/molecules/buttons/CopyButton';

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
        isCopyFlagged(definition) {
            return (_.get(definition, 'copyFlag') === true);
        },
        mouseInOut(idx, flag) {
            this.$set(this.active, idx, flag);
        },
        getValue(name) {
            return this.item[name] ? this.item[name] : '';
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
            min-width: 150px;
            width: 25%;
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
