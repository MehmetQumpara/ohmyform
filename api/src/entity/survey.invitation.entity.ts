import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm'

@Entity({ name: 'survey_invitations', schema: 'survey_test' })
@Index(['formId', 'msisdn'], { unique: true })
export class SurveyInvitationEntity {
  @PrimaryColumn({ name: 'invitation_token', type: 'varchar', length: 255 })
  invitationToken: string // C# GUID

  @Column({ name: 'form_id', type: 'varchar', length: 100 })
  formId: string // C# GUID (form.form_token ile eşleşir)

  @Column({ name: 'msisdn', type: 'varchar', length: 50 })
  msisdn: string

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean

  @CreateDateColumn({ name: 'created_at', type: 'date' })
  createdAt: Date
}
