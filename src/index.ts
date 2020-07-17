/* eslint-disable import/first,import/newline-after-import */
import './styles/style.scss';

// lib
import * as Fluent from './lib/fluent-api';
import * as Mock from './lib/mock';
import * as ApiToolSet from './lib/api';
import * as Translations from './translations';
export {
    Fluent,
    Mock,
    ApiToolSet,
    Translations,
};


// atom components
export { default as PI } from './components/atoms/icons/PI.vue';
export { default as PButton } from './components/atoms/buttons/Button.vue';
export { default as PBadge } from './components/atoms/badges/Badge.vue';
export { default as PEmpty } from './components/atoms/empty/Empty.vue';
export { default as PCol } from './components/atoms/grid/col/Col.vue';
export { default as PRow } from './components/atoms/grid/row/Row.vue';
export { default as PHr } from './components/atoms/hr/Hr.vue';
export { default as PTextInput } from './components/atoms/inputs/TextInput.vue';
export { default as PLabel } from './components/atoms/labels/Label.vue';
export { default as PDd } from './components/atoms/lists/dl-list/Dd.vue';
export { default as PDl } from './components/atoms/lists/dl-list/Dl.vue';
export { default as PDt } from './components/atoms/lists/dl-list/Dt.vue';
export { default as PLi } from './components/atoms/lists/orun-list/Li.vue';
export { default as POl } from './components/atoms/lists/orun-list/Ol.vue';
export { default as PUl } from './components/atoms/lists/orun-list/Ul.vue';
export { default as PTd } from './components/atoms/table/Td.vue';
export { default as PTh } from './components/atoms/table/Th.vue';
export { default as PTr } from './components/atoms/table/Tr.vue';

// molecule components
export { default as PNoticeAlert } from './components/molecules/alert/notice/NoticeAlert.vue';
export { default as PNumberBadge } from './components/molecules/badges/number-badge/NumberBadge.vue';
export { default as PRouteBreadcrumb } from './components/molecules/breadcrumbs/breadcrumb/RouteBreadcrumb.vue';

// molecule button components
export { default as PCopyButton } from './components/molecules/buttons/CopyButton.vue';
export { default as PIconButton } from './components/molecules/buttons/IconButton.vue';
export { default as PLoadingButton } from './components/molecules/buttons/LoadingButton.vue';

// molecule form components
export { default as PCheckBox } from './components/molecules/forms/checkbox/CheckBox.vue';
export { default as PDictInput } from './components/molecules/forms/dict-input/DictInput.vue';
import * as PDictInputToolset from './components/molecules/forms/dict-input/DictInput.toolset';
export { default as PTagsInput } from './components/organisms/forms/tags-input/TagsInput.vue';
export { default as PRadio } from './components/molecules/forms/radio/Radio.vue';
export { default as PSelect } from './components/molecules/forms/select/Select.vue';

// molecule layout components
export { default as PGridLayout } from './components/molecules/layouts/grid-layout/GridLayout.vue';
export { default as PBoxLayout } from './components/molecules/layouts/box-layout/BoxLayout.vue';
export { default as PPaneLayout } from './components/molecules/layouts/pane-layout/PaneLayout.vue';

// molecule tables components
export { default as PTable } from './components/molecules/tables/Table.vue';
import * as PTableToolset from './components/molecules/tables/toolset';

// organisms buttons
export { default as PSelectBtnGroup } from './components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';

// organisms context menu
export { default as PContextMenu } from './components/organisms/context-menu/context-menu/ContextMenu.vue';

// organisms dropdown
export { default as PDropdownBtn } from './components/organisms/dropdown/dropdown-btn/DropdownBtn.vue';
export { default as PDropdownMenuBtn } from './components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
export { default as PSelectDropdown } from './components/organisms/dropdown/select-dropdown/SelectDropdown.vue';

// organisms dynamic view
export { default as PDynamicField } from './components/organisms/dynamic-view/dynamic-field/DynamicField.vue';

// organisms forms
export { default as PJsonSchemaFieldGroup } from './components/organisms/forms/json-schema-field-group/JsonSchemaFieldGroup.vue';
export { default as PJsonSchemaForm } from './components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import * as PJsonSchemaFormToolSet from './components/organisms/forms/json-schema-form/toolset';

// organisms tables
export { default as PDataTable } from './components/organisms/tables/data-table/DataTable.vue';
import * as PDataTableToolSet from './components/organisms/tables/data-table/DataTable.toolset';
export { default as PToolboxTable } from './components/organisms/tables/toolbox-table/ToolboxTable.vue';
import * as PToolboxTableToolSet from './components/organisms/tables/toolbox-table/toolset';


// tool sets
export {
    PDictInputToolset,
    PTableToolset,
    PJsonSchemaFormToolSet,
    PDataTableToolSet,
    PToolboxTableToolSet,
};
