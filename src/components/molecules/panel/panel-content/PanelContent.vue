<template>
    <p-dl class="row">
        <div v-for="(def, idx) in defs" :key="idx" class="col-sm-12 col-md-6 content-list">
            <slot name="details">
                <p-dt class="col-sm-12 col-md-2">
                    {{ def.label }}
                </p-dt>
                <p-dd :ref="'dd-'+def.name"
                      class="col-sm-12 col-md-10 copyFlagged"
                      @mouseenter="mouseInOut(idx,true)"
                      @mouseleave="mouseInOut(idx,false)"
                >
                    <slot :name="`def-${def.name}-format`"
                          :value="getValue(def.name)"
                          :item="item"
                          :def="def"
                    >
                        {{ getValue(def.name) }}
                    </slot>
                    <template v-if="activeArr(idx,def)">
                        &nbsp;&nbsp; <p-button v-if="isCopyFlagged(def)"
                                               style="display: inline-block;" outline
                                               :style-type="'secondary'"
                                               :size="'sm'"
                                               @click="copyText($event)"
                        >
                            {{ tr('COMMON.COPY') }}
                        </p-button>
                    </template>
                </p-dd>
            </slot>
        </div>
    </p-dl>
</template>

<script>
import _ from 'lodash';
import PDt from '@/components/atoms/definition/dt/Dt';
import PDl from '@/components/atoms/definition/dl/Dl';
import PDd from '@/components/atoms/definition/dd/Dd';
import PButton from '@/components/atoms/buttons/Button';

export default {
    name: 'PPanelContent',
    components: {
        PButton,
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
            default: () => new Object(),
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
            const emptyArr = [];
            for (let i = 0; i < this.defs.length; i++) {
                emptyArr.push(false);
            }
            this.active = emptyArr;
        },
        isCopyFlagged(definition) {
            return (_.get(definition, 'copyFlag') === true);
        },
        copyText(event) {
            const rawText = event.target.parentElement.innerText;
            const copyLength = this.tr('COMMON.COPY').length;
            const text = rawText.slice(0, -copyLength).trim();
            this.selectToCopyToClipboard(text);
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
    .content-list {
        > dt {
            float: left;
            overflow: hidden;
            clear: left;
            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-height: 20px;
            padding: 0rem 1rem 0rem 1rem;
            text-align: left;
            font: Bold 14px/32px Arial;
            letter-spacing: 0;
            color: $gray1;
        }
        > dd {
            overflow: hidden;
            min-height: 20px;
            text-align: left;
            font: 14px/32px Arial;
            color: #222532;
            opacity: 1;


        }
    }
</style>
