<template>
  <div class="animated fadeIn">
    <div class="row">
      <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
        <b-card class="base first-tab summary">
          <b-container fluid class="mt-4">
            <b-row v-if="currentState=='UPT'" class="my-1">
              <b-col sm="3">
                <label class="control-label">{{tr('PG_ID')}} :</label>
              </b-col>
              <b-col sm="9">
                {{ projectId }}
              </b-col>
            </b-row>
            <b-row v-if="currentState=='CRT' && !isEmpty(projectGroup)" class="my-1">
              <b-col sm="3">
                <label class="control-label">{{tr('PG_GR')}} :</label>
              </b-col>
                <b-col sm="9">
                  {{ projectGroup }}
                </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="3">
                <label class="control-label">{{tr('PG_NM')}} :</label>
              </b-col>
              <b-col sm="9">
                <b-form-group>
                  <b-form-input v-model="projectName" :placeholder="projectName" type="text" />
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

const project = {
    projectId: null,
    projectName: null
};

export default {
    name: 'ProjectEditPopUpName',
    components: {},
    props: {
        projectProp: {
            type: Object,
            default: () => (project)
        }
    },
    data () {
        return {
            isInitialized: true,
            placeHolderId: null,
            placeHolderName: null,
            projectGroup: null,
            projectId: this.projectProp.projectId,
            projectName: this.projectProp.projectName,
            treeDataSelected: {},
            isValidated: {
                isEmpty: true,
                isOverMaxLength: true
            },
            currentState: null
        };
    },
    watch: {
        projectId: function (newProjectID) {
            this.projectProp.projectId = newProjectID;
        },
        projectName: function (newProjectName) {
            this.projectProp.projectName = newProjectName;
        }
    },
    created () {
        const selected = this.$attrs['selected-data'];
        const selectedNode = selected.hasOwnProperty('selectedItem') ? selected.selectedItem.tree.getSelected()[0] : selected.tree.getSelected()[0];
        if (Object.keys(this.$attrs).length > 0) {
            this.treeDataSelected = selected;
            if (this.$attrs['is-creatable']) {
                this.currentState = 'CRT';
                this.projectId = null;
                this.projectName = null;
            } else if (this.$attrs['is-updatable']) {
                this.currentState = 'UPT';
                this.projectProp.projectId= selectedNode.data.id;
                this.projectId = selectedNode.data.id;
                this.projectName = selectedNode.title;
            } else {
                this.currentState = 'DEL';
            }
        }

        if (this.currentState === 'CRT' && this.$attrs['selected-data'].flag.charAt(0) == 'S') {
            this.projectGroup = this.$attrs['selected-data'].tree.getSelected()[0].title;
        }
    },
    methods: {
        validateProject(){
            this.lengthOver();
            this.lengthZero();
            return (this.isValidated.isOverMaxLength && this.isValidated.isEmpty) ? true: false;
        },
        lengthZero () {
            if (this.isEmpty(this.projectName)) {
                this.isValidated.isEmpty = false;
            }
        },
        lengthOver (){
            if (this.projectName.length > 40) {
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
                return this.projectProp.projectId;
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
