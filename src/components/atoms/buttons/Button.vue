<template>
    <button type="button" :class="classObject" @click="onClick">
        <slot>button</slot>
    </button>
</template>

<script>

export default {
    name: 'p-button',
    events:['click'],
    props: {
        href: {
            type:String,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        },
        outline:{
            type: Boolean,
            default: false
        },
        styleType:{
            type: String,
            default: null,
            validator(value){
                return [
                    null,
                    'primary',
                    'secondary',
                    'success',
                    'danger',
                    'warning',
                    'info',
                    'light',
                    'dark'
                ].indexOf(value) !== -1;
            }
        },
        link:{
            type: Boolean,
            default: false
        },
        block:{
            type: Boolean,
            default: false
        },
        size:{
            type: String,
            default: null,
            validator(value){
                return [
                    null,
                    'sm',
                    'lg'
                ].indexOf(value) !== -1;
            }
        }
    },
    computed:{
        classObject(){
            let obj = ['btn'];
            obj.push({
                'disabled':this.disabled,
                'btn-block':this.block
            });
            if (this.style_class != null){
                obj.push(this.style_class);
            }
            if (this.size){
                obj.push('btn-'+this.size);
            }
            return obj;
        },
        style_class(){
            if (this.link){
                return 'btn-link';
            } else if (this.styleType){
                let prefix = 'btn-';
                if (this.outline){
                    prefix += 'outline-';
                }
                return prefix+this.styleType;
            } else {
                return null;
            }
        }
    },
    methods:{
        onClick(event){
            if (!this.disabled){
                if (this.href!=null&&this.href.trim()){
                    location.href=this.href;
                }
                /**
                 * button click event, only emit when disabled value is false
                 * @event click
                 * @type {MouseEvent}
                 */
                this.$emit('click',event);
            }
        }
    }
};
</script>

<style scoped>

</style>