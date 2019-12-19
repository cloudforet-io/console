import PRow from '@/components/atoms/grid/row/Row';
import PCol from '@/components/atoms/grid/col/Col';

export default {
    title: 'atoms/grid/row',
    component: PRow,
    parameters: {
        info: {
            summary: '',
            components: { PRow },
        },
    },
};

export const DefaultCase = () => ({
    components: { PRow },
    template: `
<div style="border: 1px dashed #0f69ff;width: 40vw;">
  <p-row style="border: 1px solid #d90039;">
      <div style="width: 100%; height: 20vh;background-color: gray">row1</div>
  </p-row> 
</div>
`,
});

export const multiRow = () => ({
    components: { PRow },
    template: `
<div style="border: 1px dashed #0f69ff;width: 40vw;">
  <p-row style="border: 1px solid #d90039;">
      <div style="width: 100%; height: 20vh;background-color: gray">row1</div>
  </p-row>
  <p-row style="border: 1px solid #d90039;">
      <div style="width: 100%; height: 20vh;background-color: gray">row2</div>
  </p-row>
  <p-row style="border: 1px solid #d90039;">
      <div style="width: 100%; height: 20vh;background-color: gray">row3</div>
  </p-row>
</div>
`,
});

export const supportFlexBox = () => ({
    components: { PRow, PCol },
    template: `
<div style="border: 1px dashed #0f69ff;width: 80vw;">
  <p-row :inline="true" style="border: 1px solid #d90039;">
      <div style="width: 100%; height: 80px;background-color: gray">inline-row</div>
  </p-row>
    <p-row :inline="true" style="border: 1px solid #d90039;">
        <div style="width: 100%; height: 80px;background-color: gray">inline-row</div>
    </p-row>
    <p-row justify-content="center" style="border: 1px solid #d90039;">
        <p-col :flex-grow="0" style="background-color: whitesmoke;border: 1px solid #20a8d8">this</p-col>
        <p-col :flex-grow="0" style="background-color: whitesmoke;border: 1px solid #20a8d8"> is </p-col>
        <p-col :flex-grow="0" style="background-color: whitesmoke;border: 1px solid #20a8d8">center</p-col>
    </p-row>
    <p-row justify-content="space-around" style="border: 1px solid #d90039;">
        <p-col :flex-grow="0" style="background-color: whitesmoke;border: 1px solid #20a8d8">this</p-col>
        <p-col :flex-grow="0" style="background-color: whitesmoke;border: 1px solid #20a8d8"> is </p-col>
        <p-col :flex-grow="0" style="background-color: whitesmoke;border: 1px solid #20a8d8">center</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
      <div style="width: 100%; height: 80px;background-color: gray">row3</div>
  </p-row>
</div>
`,
});
