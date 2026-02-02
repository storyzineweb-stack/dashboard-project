import { ref, reactive, computed } from 'vue'

type ValidationRule<T = any> = {
  validate: (value: T) => boolean
  message: string
}

type FieldRules = {
  [key: string]: ValidationRule[]
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  rules: FieldRules = {}
) {
  const formData = reactive<T>({ ...initialValues })
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const isSubmitting = ref(false)

  function validateField(fieldName: string): boolean {
    const fieldRules = rules[fieldName]
    if (!fieldRules) return true

    for (const rule of fieldRules) {
      if (!rule.validate(formData[fieldName])) {
        errors[fieldName] = rule.message
        return false
      }
    }

    delete errors[fieldName]
    return true
  }

  function validateAll(): boolean {
    let isValid = true

    for (const fieldName in rules) {
      if (!validateField(fieldName)) {
        isValid = false
      }
    }

    return isValid
  }

  function handleBlur(fieldName: string) {
    touched[fieldName] = true
    validateField(fieldName)
  }

  function handleInput(fieldName: string) {
    if (touched[fieldName]) {
      validateField(fieldName)
    }
  }

  function reset() {
    Object.assign(formData, initialValues)
    Object.keys(errors).forEach((key) => delete errors[key])
    Object.keys(touched).forEach((key) => delete touched[key])
    isSubmitting.value = false
  }

  const isValid = computed(() => {
    return Object.keys(errors).length === 0
  })

  const hasErrors = computed(() => {
    return Object.keys(errors).length > 0
  })

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    validateField,
    validateAll,
    handleBlur,
    handleInput,
    reset
  }
}

// 일반적인 검증 규칙들
export const validators = {
  required: (message = '필수 입력 항목입니다'): ValidationRule => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  email: (message = '유효한 이메일 주소를 입력하세요'): ValidationRule => ({
    validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  minLength: (
    length: number,
    message = `최소 ${length}자 이상 입력하세요`
  ): ValidationRule => ({
    validate: (value) => !value || value.length >= length,
    message
  }),

  maxLength: (
    length: number,
    message = `최대 ${length}자까지 입력 가능합니다`
  ): ValidationRule => ({
    validate: (value) => !value || value.length <= length,
    message
  }),

  pattern: (regex: RegExp, message = '형식이 올바르지 않습니다'): ValidationRule => ({
    validate: (value) => !value || regex.test(value),
    message
  }),

  min: (min: number, message = `${min} 이상의 값을 입력하세요`): ValidationRule => ({
    validate: (value) => !value || Number(value) >= min,
    message
  }),

  max: (max: number, message = `${max} 이하의 값을 입력하세요`): ValidationRule => ({
    validate: (value) => !value || Number(value) <= max,
    message
  })
}
