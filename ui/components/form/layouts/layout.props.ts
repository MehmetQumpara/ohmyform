import { FormPublicFragment } from '../types/form.public.types'
import { Submission } from '../../use.submission'

export interface LayoutProps {
  form: FormPublicFragment
  submission: Submission
}
