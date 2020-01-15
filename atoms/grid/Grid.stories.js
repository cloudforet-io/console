import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';

export default {
    title: 'atoms/grid',
    component: PCol,
    parameters: {
        info: {
            summary: '',
            components: { PCol },
        },
    },
};


export const ColDefaultCase = () => ({
    components: { PRow, PCol },
    template: `
<div style="border: 1px dashed #0f69ff;width: 80vw;">
    <p-row style="border: 1px solid #d90039;">
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8">col</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="1" v-for="(_,idx) in Array(12)" style="background-color: whitesmoke;border: 1px solid #20a8d8">col-1 : 12 of {{idx+1}}</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="2" v-for="(_,idx) in Array(6)" style="background-color: whitesmoke;border: 1px solid #20a8d8">col-2 : 6 of {{idx+1}}</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="3" v-for="(_,idx) in Array(4)" style="background-color: whitesmoke;border: 1px solid #20a8d8">col-3 : 4 of {{idx+1}}</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="4" v-for="(_,idx) in Array(3)" style="background-color: whitesmoke;border: 1px solid #20a8d8">col-4 : 3 of {{idx+1}}</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="6" v-for="(_,idx) in Array(2)" style="background-color: whitesmoke;border: 1px solid #20a8d8">col-6 : 2 of {{idx+1}}</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="1"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-1</p-col>
        <p-col :col="11"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-11</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="2"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-2</p-col>
        <p-col :col="10"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-10</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="3"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-3</p-col>
        <p-col :col="9"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-9</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="4"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-4</p-col>
        <p-col :col="8"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-8</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col :col="5"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-5</p-col>
        <p-col :col="7"  style="background-color: whitesmoke;border: 1px solid #20a8d8">col-7</p-col>
    </p-row>
    
</div>
`,
});

export const ColSupportFlexBox = () => ({
    components: { PRow, PCol },
    template: `
<div style="border: 1px dashed #0f69ff;width: 80vw;">
    <p-row style="border: 1px solid #d90039;">
        <p-col :flexGrow="1" style="background-color: whitesmoke;border: 1px solid #20a8d8">flex-glow:1</p-col>
        <p-col :flexGrow="10" style="background-color: whitesmoke;border: 1px solid #20a8d8">flex-glow:10</p-col>
        <p-col :flexGrow="3" style="background-color: whitesmoke;border: 1px solid #20a8d8">flex-glow:3</p-col>
    </p-row>
    <p-row style="border: 1px solid #d90039;">
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 80px">col</p-col>
        <p-col alignSelf="flex-end" style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 30px">alignSelf:flex-end</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 80px">col</p-col>
        <p-col alignSelf="center" style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 20px">alignSelf:center</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 80px">col</p-col>
        <p-col alignSelf="baseline" style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 30px">alignSelf:baseline</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 80px">col</p-col>
        <p-col alignSelf="stretch" style="background-color: whitesmoke;border: 1px solid #20a8d8;">alignSelf:stretch</p-col>
        <p-col style="background-color: whitesmoke;border: 1px solid #20a8d8; height: 80px">col</p-col>
    </p-row>
</div>
`,
});


export const RowDefaultCase = () => ({
    components: { PRow },
    template: `
<div style="border: 1px dashed #0f69ff;width: 40vw;">
  <p-row style="border: 1px solid #d90039;">
      <div style="width: 100%; height: 20vh;background-color: gray">row1</div>
  </p-row> 
</div>
`,
});

export const RowMulti = () => ({
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

export const RowSupportFlexBox = () => ({
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
