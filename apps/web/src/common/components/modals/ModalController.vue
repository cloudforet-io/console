<script lang="ts" setup>
import { ref } from 'vue';

interface ModalControllerProps {
    modalTarget: string;
}

interface ModalControllerEmits {
    (e: 'close'): void;
    (e: 'trigger'): void;
}

const props = defineProps<ModalControllerProps>();
const emit = defineEmits<ModalControllerEmits>();

const modalVisible = ref<boolean>(false);

const handleOpen = () => {
    modalVisible.value = true;
    emit('trigger');
};

const handleClose = () => {
    modalVisible.value = false;
    emit('close');
};

</script>

<template>
    <fragment>
        <slot name="trigger"
              v-bind="{
                  trigger: handleOpen,
              }"
        />
        <portal :to="props.modalTarget">
            <slot name="modal"
                  v-bind="{
                      visible: modalVisible,
                      onClose: handleClose,
                  }"
            />
        </portal>
    </fragment>
</template>
