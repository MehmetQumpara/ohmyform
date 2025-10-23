import { AuthController } from './auth.controller'
import { UserController } from './user.controller'
import { UsersController } from './users.controller'
import { SettingsController } from './settings.controller'
import { AdminController } from './admin.controller'
import { FormsController } from './forms.controller'
import { FormPublicController } from './form.public.controller'
import { SubmissionsController } from './submissions.controller'
import { SubmissionPublicController } from './submission-public.controller'
import { StatusController } from './status.controller'

export const controllers = [AuthController, UserController, UsersController, SettingsController, AdminController, FormsController, FormPublicController, SubmissionsController, SubmissionPublicController, StatusController]
