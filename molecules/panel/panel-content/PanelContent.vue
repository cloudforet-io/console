<template>
    <p-dl class="row">
        <div v-for="(def, idx) in definitionList" :key="idx" class="col-sm-12 col-md-6 content-list">
            <slot name="details">
                <p-dt class="col-sm-12 col-md-4">
                    {{ def.title }}
                </p-dt>
                <p-dd v-if="hasURL" class="col-sm-12 col-md-8 copyFlagged"
                      @mouseover="mouseInOut(idx,true)"
                      @mouseleave="mouseInOut(idx,false)"
                >
                    <a :href="def.contents.link">{{ def.contents.text }}</a>
                    <template v-if="activeArr(idx)">
                        &nbsp;&nbsp; <p-button v-if="isCopyFlagged(def)"
                                               style="display: inline-block;" outline
                                               :style-type="'secondary'"
                                               :size="'sm'"
                                               @click="copyText(def.contents.text)"
                        >
                            {{ tr('COMMON.COPY') }}
                        </p-button>
                    </template>
                </p-dd>
                <p-dd v-else class="col-sm-12 col-md-8 copyFlagged"
                      @mouseover="mouseInOut(idx,true)"
                      @mouseleave="mouseInOut(idx,false)"
                      >
                    {{ def.contents.text }}
                    <template v-if="activeArr(idx)">
                        &nbsp;&nbsp; <p-button v-if="isCopyFlagged(def)"
                                               style="display: inline-block;" outline
                                               :style-type="'secondary'"
                                               :size="'sm'"
                                               @click="copyText(def.contents.text)"
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
    name: 'PanelContent',
    components: {
        PButton,
        PDt,
        PDl,
        PDd,
    },
    props: {
        definitionList: {
            type: Array,
            default: () => [],
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
        activeArr(idx){
            return this.active[idx];
        },
        setActiveArray() {
            let emptyArr = [];
            for (let i = 0; i < this.definitionList.length; i++) {
                emptyArr.push(false);
            }
            this.active = emptyArr;
        },
        isCopyFlagged(definition) {
            return (_.get(definition, 'copyFlag') === true);
        },
        hasURL(contents) {
            return (!this.isEmpty(_.get(contents, 'link')));
        },
        copyText(text) {
            this.selectToCopyToClipboard(text);
        },
        mouseInOut(idx, flag) {
            this.$set(this.active, idx, flag);
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
