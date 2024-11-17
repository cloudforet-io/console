import { useFieldValidator, useFormValidator } from '@/common/composables/form-validator';

describe('useFieldValidator', () => {
    it('should not change invalid state immediately on initialization', () => {
        const {
            value, isInvalid, invalidText,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'));

        expect(value.value).toBe('');
        expect(isInvalid.value).toBeUndefined();
        expect(invalidText.value).toBe('');
    });

    it('should change invalid state immediately on initialization if immediate is true', () => {
        const {
            value, isInvalid, invalidText,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'), true);

        expect(value.value).toBe('');
        expect(isInvalid.value).toBe(true);
        expect(invalidText.value).toBe('Required');
    });

    it('should apply validation result immediately on initialization regardless of immediate value', () => {
        const {
            value, validationResult,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'), false);

        expect(value.value).toBe('');
        expect(validationResult.value).toBe(false);
    });

    it('should change value after set value', () => {
        const {
            value, setValue,
        } = useFieldValidator<string>('');

        setValue('123');
        expect(value.value).toBe('123');
    });

    it('should change invalid state after set value', () => {
        const {
            setValue, isInvalid, invalidText,
        } = useFieldValidator<string>('123', (v) => (v.trim() ? true : 'Required'));

        setValue(' ');
        expect(isInvalid.value).toBe(true);
        expect(invalidText.value).toBe('Required');
    });

    it('should change validation result after set value', () => {
        const {
            setValue, validationResult,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'));

        setValue('123');
        expect(validationResult.value).toBe(true);
    });

    it('should reset value to initial value after reset', () => {
        const {
            value, setValue, reset,
        } = useFieldValidator<string>('');

        setValue('123');
        reset();
        expect(value.value).toBe('');
    });

    it('should reset invalid state after reset', () => {
        const {
            setValue, reset, isInvalid, invalidText,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'));

        setValue('123');
        reset();
        expect(isInvalid.value).toBeUndefined();
        expect(invalidText.value).toBe('');
    });

    it('should apply validation result immediately after reset', () => {
        const {
            setValue, reset, validationResult,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'));

        setValue('123');
        reset();
        expect(validationResult.value).toBe(false);
    });

    it('should initialize after resetValidation - reset invalid state', () => {
        const {
            setValue, resetValidation, isInvalid, invalidText,
        } = useFieldValidator<string>('123', (v) => (v.trim() ? true : 'Required'));

        setValue('');
        resetValidation();
        expect(isInvalid.value).toBeUndefined();
        expect(invalidText.value).toBe('');
    });

    it('should not affect invalid state and validation result after resetValidation with immediate true', () => {
        const {
            setValue, resetValidation, isInvalid, invalidText, validationResult,
        } = useFieldValidator<string>('123', (v) => (v.trim() ? true : 'Required'), true);

        setValue('');
        resetValidation();
        expect(isInvalid.value).toBe(true);
        expect(invalidText.value).toBe('Required');
        expect(validationResult.value).toBe(false);
    });

    it('should change invalid state after execute validate', () => {
        const {
            validate, isInvalid, invalidText,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'));

        validate();
        expect(isInvalid.value).toBe(true);
        expect(invalidText.value).toBe('Required');
    });

    it('should change validation result after execute validate', () => {
        const {
            validate, validationResult,
        } = useFieldValidator<string>('', (v) => (v.trim() ? true : 'Required'));

        validate();
        expect(validationResult.value).toBe(false);
    });
});

describe('useFormValidator', () => {
    const forms = { name: '', age: 0 };
    const validators = {
        name: (v: string) => (v.trim() ? true : 'Name is required'),
        age: (v: number) => (v > 0 ? true : 'Age must be positive'),
    };

    it('should initialize forms and states correctly', () => {
        const { forms: { name, age }, invalidState, invalidTexts } = useFormValidator(forms, validators);

        expect(name.value).toBe('');
        expect(age.value).toBe(0);

        expect(invalidState.name).toBeUndefined();
        expect(invalidState.age).toBeUndefined();

        expect(invalidTexts.name).toBe('');
        expect(invalidTexts.age).toBe('');
    });

    it('should validate fields immediately if immediate is true', () => {
        const { invalidState, invalidTexts } = useFormValidator(forms, validators, true);

        expect(invalidState.name).toBe(true);
        expect(invalidState.age).toBe(true);

        expect(invalidTexts.name).toBe('Name is required');
        expect(invalidTexts.age).toBe('Age must be positive');
    });

    it('should validate specific fields immediately if partial immediate map is provided', () => {
        const { invalidState, invalidTexts } = useFormValidator(forms, validators, { name: true });

        expect(invalidState.name).toBe(true);
        expect(invalidState.age).toBeUndefined();

        expect(invalidTexts.name).toBe('Name is required');
        expect(invalidTexts.age).toBe('');
    });

    it('should update field values and trigger validation', () => {
        const {
            forms: { name, age }, setForm, invalidState, invalidTexts,
        } = useFormValidator({ name: '', age: 0 }, {
            name: (v: string) => (v.trim() ? true : 'Name is required'),
            age: (v: number) => (v > 0 ? true : 'Age must be positive'),
        });
        setForm('name', 'John');
        expect(name.value).toBe('John');
        expect(invalidState.name).toBe(false);
        expect(invalidTexts.name).toBe('');

        setForm('age', -1);
        expect(age.value).toBe(-1);
        expect(invalidState.age).toBe(true);
        expect(invalidTexts.age).toBe('Age must be positive');
    });

    it('should allow batch updates for fields and trigger validation', () => {
        const {
            forms: { name, age }, setForm, invalidState, invalidTexts,
        } = useFormValidator(forms, validators);

        setForm({ name: 'John', age: 25 });

        expect(name.value).toBe('John');
        expect(age.value).toBe(25);

        expect(invalidState.name).toBe(false);
        expect(invalidState.age).toBe(false);

        expect(invalidTexts.name).toBe('');
        expect(invalidTexts.age).toBe('');
    });

    it('should reset all fields to initial values and states', () => {
        const {
            forms: { name, age }, setForm, resetAll, invalidState, invalidTexts,
        } = useFormValidator(forms, validators);

        setForm({ name: 'John', age: 25 });
        resetAll();

        expect(name.value).toBe('');
        expect(age.value).toBe(0);

        expect(invalidState.name).toBeUndefined();
        expect(invalidState.age).toBeUndefined();

        expect(invalidTexts.name).toBe('');
        expect(invalidTexts.age).toBe('');
    });

    it('should reset specific field validation state', () => {
        const {
            setForm, resetValidation, invalidState, invalidTexts,
        } = useFormValidator(forms, validators);

        setForm('name', 'John');
        setForm('age', -1);

        expect(invalidState.age).toBe(true);
        expect(invalidTexts.age).toBe('Age must be positive');

        resetValidation('age');

        expect(invalidState.age).toBeUndefined();
        expect(invalidTexts.age).toBe('');
    });

    it('should validate all fields and apply their results', () => {
        const { validateAll, invalidState, invalidTexts } = useFormValidator(forms, validators);

        validateAll();

        expect(invalidState.name).toBe(true);
        expect(invalidTexts.name).toBe('Name is required');

        expect(invalidState.age).toBe(true);
        expect(invalidTexts.age).toBe('Age must be positive');
    });

    it('should validate specific field and apply its result', () => {
        const { validate, invalidState, invalidTexts } = useFormValidator(forms, validators);

        validate('name');

        expect(invalidState.name).toBe(true);
        expect(invalidTexts.name).toBe('Name is required');

        expect(invalidState.age).toBeUndefined();
        expect(invalidTexts.age).toBe('');
    });

    it('should reset all validation states without resetting values', () => {
        const {
            forms: { name, age }, setForm, resetValidations, invalidState, invalidTexts,
        } = useFormValidator(forms, validators);

        setForm('name', 'John');
        setForm('age', -1);

        resetValidations();

        expect(name.value).toBe('John');
        expect(age.value).toBe(-1);

        expect(invalidState.name).toBeUndefined();
        expect(invalidState.age).toBeUndefined();

        expect(invalidTexts.name).toBe('');
        expect(invalidTexts.age).toBe('');
    });

    it('should isAllValid be true if all fields are valid regardless of immediate value', () => {
        const { forms: { name }, setForm, isAllValid } = useFormValidator({ name: '' }, {});

        expect(isAllValid.value).toBe(true);

        setForm('name', 'John');
        expect(name.value).toBe('John');
        expect(isAllValid.value).toBe(true);
    });

    // TODO: Remove after removing initForm
    it('should reset all fields to initial values and validation states when initForm is called', () => {
        const {
            forms: { name, age },
            setForm,
            initForm,
            invalidState,
            invalidTexts,
        } = useFormValidator({ name: '', age: 0 }, {
            name: (v: string) => (v.trim() ? true : 'Name is required'),
            age: (v: number) => (v > 0 ? true : 'Age must be positive'),
        });

        // Change values
        setForm({ name: 'John', age: -1 });

        // Check states
        expect(name.value).toBe('John');
        expect(age.value).toBe(-1);
        expect(invalidState.name).toBe(false);
        expect(invalidState.age).toBe(true);
        expect(invalidTexts.age).toBe('Age must be positive');

        // Reset all fields and validation states
        initForm();

        // Check states after reset
        expect(name.value).toBe('');
        expect(age.value).toBe(0);
        expect(invalidState.name).toBeUndefined();
        expect(invalidState.age).toBeUndefined();
        expect(invalidTexts.name).toBe('');
        expect(invalidTexts.age).toBe('');
    });
});

describe('useFieldValidator interaction with useFormValidator', () => {
    it('should sync value updates between useFieldValidator and useFormValidator', () => {
        const nameValidator = useFieldValidator<string>(
            '',
            (value) => (value.trim() ? true : 'Name is required'),
            true,
        );

        const {
            forms: { name },
            invalidState,
            invalidTexts,
            setForm,
        } = useFormValidator({
            name: nameValidator,
            age: 0,
        }, {
            age: (value) => (value > 0 ? true : 'Age must be positive'),
        });

        // Update value via useFieldValidator
        nameValidator.setValue('John');
        expect(name.value).toBe('John'); // Sync from field validator to form validator
        expect(invalidState.name).toBe(false);
        expect(invalidTexts.name).toBe('');

        // Update value via useFormValidator
        setForm('name', ' ');
        expect(name.value).toBe(' '); // Sync from form validator to field validator
        expect(invalidState.name).toBe(true);
        expect(invalidTexts.name).toBe('Name is required');
    });

    it('should validate field via useFieldValidator independently', () => {
        const nameValidator = useFieldValidator<string>(
            '',
            (value) => (value.trim() ? true : 'Name is required'),
            true,
        );

        const { invalidState, invalidTexts } = useFormValidator({
            name: nameValidator,
            age: 0,
        }, {
            age: (value) => (value > 0 ? true : 'Age must be positive'),
        });

        // Trigger validation via useFieldValidator
        nameValidator.setValue('');
        nameValidator.validate();
        expect(invalidState.name).toBe(true);
        expect(invalidTexts.name).toBe('Name is required');

        nameValidator.setValue('John');
        nameValidator.validate();
        expect(invalidState.name).toBe(false);
        expect(invalidTexts.name).toBe('');
    });

    it('should reset validation states via useFieldValidator', () => {
        const nameValidator = useFieldValidator<string>(
            '',
            (value) => (value.trim() ? true : 'Name is required'),
            true,
        );

        const { invalidState, invalidTexts } = useFormValidator({
            name: nameValidator,
            age: 0,
        }, {
            age: (value) => (value > 0 ? true : 'Age must be positive'),
        });

        // Trigger validation via useFieldValidator
        nameValidator.setValue('John');
        nameValidator.validate();
        expect(invalidState.name).toBe(false);

        // Reset validation via useFieldValidator
        nameValidator.resetValidation();
        expect(invalidState.name).toBeFalsy();
        expect(invalidTexts.name).toBe('');
    });

    it('should handle immediate validation when useFieldValidator is used', () => {
        const nameValidator = useFieldValidator<string>(
            '',
            (value) => (value.trim() ? true : 'Name is required'),
            true,
        );

        const { invalidState, invalidTexts } = useFormValidator({
            name: nameValidator,
            age: 0,
        }, {
            age: (value) => (value > 0 ? true : 'Age must be positive'),
        });

        // Immediate validation should be applied
        expect(invalidState.name).toBe(true);
        expect(invalidTexts.name).toBe('Name is required');

        // Should not immediately validate for other fields
        expect(invalidState.age).toBeUndefined();
        expect(invalidTexts.age).toBe('');
    });

    it('should reset value and validation state correctly via useFieldValidator', () => {
        const nameValidator = useFieldValidator<string>(
            '',
            (value) => (value.trim() ? true : 'Name is required'),
            true,
        );

        const { forms: { name }, invalidState, invalidTexts } = useFormValidator({
            name: nameValidator,
            age: 0,
        }, {
            age: (value) => (value > 0 ? true : 'Age must be positive'),
        });

        // Update value and trigger validation
        nameValidator.setValue('John');
        expect(name.value).toBe('John');
        expect(invalidState.name).toBe(false);

        // Reset via useFieldValidator
        nameValidator.reset();
        expect(name.value).toBe('');
        expect(invalidState.name).toBe(true);
        expect(invalidTexts.name).toBe('Name is required');
    });
});


