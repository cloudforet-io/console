<template>
  <div class="animated fadeIn">
    <div class="row">
      <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
        <b-card class="base first-tab summary">
          <b-container fluid class="mt-4">
            <b-row v-if="currentState=='UPDATE'" class="my-1">
              <b-col sm="3">
                <label class="control-label">{{ this.labelMsg[0] }} :</label>
              </b-col>
              <b-col sm="9">
                {{ rezeplId }}
              </b-col>
            </b-row>
            <b-row v-if="currentState=='CREATE' && !isEmpty(rezeplGroup)" class="my-1">
              <b-col sm="3">
                <label class="control-label">{{ this.labelMsg[0] }} :</label>
              </b-col>
              <b-col sm="9">
                {{ rezeplGroup }}
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="3">
                <label class="control-label">{{ this.labelMsg[1] }} :</label>
              </b-col>
              <b-col sm="9">
                <b-form-group>
                  <b-form-input v-model="rezeplName" :placeholder="rezeplName" type="text" />
                  <b-form-invalid-feedback :state="isValidated.isEmpty">
                    Project Name cannot be Empty.
                  </b-form-invalid-feedback>
                  <b-form-invalid-feedback :state="isValidated.isOverMaxLength">
                    Project Name must not be a over a max length of 40 characters.
                  </b-form-invalid-feedback>
                </b-form-group>
              </b-col>
            </b-row>
          </b-container>
        </b-card>
      </b-col>
    </div>
  </div>
</template>
<script>

const rezepl = {
    rezeplId: null,
    rezeplName: null
};

export default {
    name: 'DataCenterEditPopUpName',
    components: {},
    props: {
        rezeplProp: {
            type: Object,
            default: () => (rezepl)
        }
    },
    data () {
        return {
            isInitialized: true,
            placeHolderId: null,
            placeHolderName: null,
            labelMsg: [],
            warningMsg: [],
            rezeplGroup: null,
            rezeplId: this.rezeplProp.rezeplId,
            rezeplName: this.rezeplProp.rezeplName,
            treeDataSelected: {},
            isValidated: {
                isEmpty: true,
                isOverMaxLength: true
            },
            currentState: null
        };
    },
    watch: {
        rezeplId: function (newProjectID) {
            this.rezeplProp.rezeplId = newProjectID;
        },
        rezeplName: function (newProjectName) {
            this.rezeplProp.rezeplName = newProjectName;
        }
    },
    created () {
        const selected = this.$attrs['selected-data'];
        const selectedNode = selected.hasOwnProperty('selectedItem') ? selected.selectedItem.tree.getSelected()[0] : selected.tree.getSelected()[0];
        if (Object.keys(this.$attrs).length > 0) {
            this.treeDataSelected = selected;
            if (this.$attrs['is-creatable']) {
                this.currentState = 'CREATE';
                this.labelMsg =this.switchLabel('CREATE', selectedNode.data.item_type);
                this.rezeplId = null;
                this.rezeplName = null;
            } else if (this.$attrs['is-updatable']) {
                this.currentState = 'UPDATE';
                this.labelMsg =this.switchLabel('UPDATE', selectedNode.data.item_type);
                this.rezeplProp.rezeplId= selectedNode.data.id;
                this.rezeplId = selectedNode.data.id;
                this.rezeplName = selectedNode.title;
            } else {
                this.currentState = 'DEL';
            }
        }

        if (this.currentState === 'CREATE' && !this.$attrs['selected-data']['root_action']) {
            this.rezeplGroup = this.$attrs['selected-data'].tree.getSelected()[0].title;
        }
    },
    methods: {
        switchLabel(flag, item_type){
            let returnVal = [this.tr(''), this.tr('')];
            if (this.isEmpty(item_type) || this.$attrs['selected-data'].flag ==='CRG'){
                returnVal = [this.tr('RG'), this.tr('RG_NM')];
            } else if (item_type === 'REGION'){
                returnVal = flag === 'CREATE' ? [this.tr('RG_ID'), this.tr('ZE_NM')] : [this.tr('RG'), this.tr('RG_NM')];
            } else if (item_type === 'ZONE'){
                returnVal = flag ==='CREATE'? [this.tr('ZE_ID'), this.tr('PL_NM')] : [this.tr('ZE'), this.tr('ZE_NM')];
            } else {
                returnVal = flag ==='CREATE'? [this.tr('PL_ID'), this.tr('PL_NM')] : [this.tr('PL'), this.tr('PL_NM')];
            }
            return returnVal;
        },
        validateDataCenter(){
            this.lengthOver();
            this.lengthZero();
            return (this.isValidated.isOverMaxLength && this.isValidated.isEmpty) ? true: false;
        },
        lengthZero () {
            if (this.isEmpty(this.rezeplName)) {
                this.isValidated.isEmpty = false;
            }
        },
        lengthOver (){
            if (this.rezeplName.length > 40) {
                this.isValidated.isOverMaxLength = false;
            }
        },
        partialRender (idx) {
            if (idx == 0 && this.currentState == 'UPT') {
                return true;
            } else {
                return false;
            }
        },
        setProp (idx) {
            if (idx == 0 && this.currentState == 'UPT') {
                return this.rezeplProp.rezeplId;
            } else {
                return false;
            }
        }

    }

};
</script>

<style lang="scss" scoped>
  .form-horizontal .control-label {
    text-align: right !important; /* !important added for priority in SO snippet. */
  }
</style>
