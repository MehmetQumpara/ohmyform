import {
  FormPublicDesignFragment,
  FormPublicFieldFragment,
} from '../types/form.public.types'

export interface FieldInputProps {
  field: FormPublicFieldFragment
  design: FormPublicDesignFragment
  focus?: boolean
  urlValue?: string
}
