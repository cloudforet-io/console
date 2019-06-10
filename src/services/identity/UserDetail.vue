<template>
  <b-card>
    <div slot="header">
      <strong>User Detail</strong>
    </div>
    <b-form>
      <b-form-group
        description="Let us know your full name."
        label="Enter your name"
        label-for="basicName"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="basicName" plaintext type="text" autocomplete="name" />
      </b-form-group>
      <b-form-group
        label="Static"
        label-for="basicStatic"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="basicStatic" plaintext type="text" value="Username" />
      </b-form-group>
      <b-form-group
        description="This is a help text"
        label="Text Input"
        label-for="basicText"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="basicText" plaintext type="text" placeholder="Text" />
      </b-form-group>
      <b-form-group
        label="Date" label-for="date"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="date" type="date" />
      </b-form-group>
      <b-form-group
        description="Please enter your email"
        label="Email Input"
        label-for="basicEmail"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="basicEmail" plaintext type="email" placeholder="Enter your email" autocomplete="email" />
      </b-form-group>
      <b-form-group
        description="Please enter a complex password"
        label="Password Input"
        label-for="basicPassword"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="basicPassword" plaintext type="password" placeholder="Enter your password" autocomplete="current-password" />
      </b-form-group>
      <b-form-group
        label="Disabled Input"
        label-for="basicInputDisabled"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="basicInputDisabled" type="text" :disabled="true" placeholder="Disabled" />
      </b-form-group>
      <b-form-group
        label="Textarea"
        label-for="basicTextarea"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-input id="basicTextarea" :textarea="true" :rows="9" placeholder="Content.." />
      </b-form-group>

      <b-form-group
        label="Inline checkboxes"
        label-for="basicInlineCheckboxes"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-checkbox-group id="basicInlineCheckboxes" name="InlineCheckboxes" :plain="true" :checked="[1,3]">
          <b-form-checkbox :plain="true" value="1">
            Option 1
          </b-form-checkbox>
          <b-form-checkbox :plain="true" value="2">
            Option 2
          </b-form-checkbox>
          <b-form-checkbox :plain="true" value="3">
            Option 3
          </b-form-checkbox>
        </b-form-checkbox-group>
      </b-form-group>
      <!--custom controls - radios/checkboxes - temporary fix-->
      <b-form-group
        label="Checkboxes - custom"
        label-for="basicCustomCheckboxes"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-checkbox-group id="basicCustomCheckboxes" stacked>
          <div class="custom-control custom-checkbox">
            <input id="customChk1" type="checkbox" class="custom-control-input" value="1" checked>
            <label class="custom-control-label" for="customChk1">Option 1</label>
          </div>
          <div class="custom-control custom-checkbox">
            <input id="customChk2" type="checkbox" class="custom-control-input" value="2">
            <label class="custom-control-label" for="customChk2">Option 2</label>
          </div>
          <div class="custom-control custom-checkbox">
            <input id="customChk3" type="checkbox" class="custom-control-input" value="3">
            <label class="custom-control-label" for="customChk3">Option 3</label>
          </div>
        </b-form-checkbox-group>
      </b-form-group>
      <b-form-group
        label="Inline checkboxes - custom"
        label-for="basicInlineCustomCheckboxes"
        :label-cols="3"
        :horizontal="true"
      >
        <b-form-checkbox-group id="basicInlineCustomCheckboxes">
          <div class="custom-control custom-checkbox custom-control-inline">
            <input id="customInChk1" type="checkbox" class="custom-control-input" value="1">
            <label class="custom-control-label" for="customInChk1">Option 1</label>
          </div>
          <div class="custom-control custom-checkbox custom-control-inline">
            <input id="customInChk2" type="checkbox" class="custom-control-input" value="2" checked>
            <label class="custom-control-label" for="customInChk2">Option 2</label>
          </div>
          <div class="custom-control custom-checkbox custom-control-inline">
            <input id="customInChk3" type="checkbox" class="custom-control-input" value="3">
            <label class="custom-control-label" for="customInChk3">Option 3</label>
          </div>
        </b-form-checkbox-group>
      </b-form-group>
      <div slot="footer">
        <b-button type="submit" size="sm" variant="primary">
          <i class="fa fa-dot-circle-o" /> Submit
        </b-button>
        <b-button type="reset" size="sm" variant="danger">
          <i class="fa fa-ban" /> Reset
        </b-button>
      </div>
    </b-form>
  </b-card>
</template>

<script>
export default {
  name: 'UserDetail'
}
</script>

<style lang="scss" scoped>

</style>
