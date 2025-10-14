import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FormEntity } from '../../entity/form.entity'
import { SubmissionEntity } from '../../entity/submission.entity'
import { VisitorEntity } from '../../entity/visitor.entity'
import { SubmissionDeleteService } from '../submission/submission.delete.service'

@Injectable()
export class FormDeleteService {
  constructor(
    @InjectRepository(FormEntity)
    private readonly formRepository: Repository<FormEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
    private readonly submissionDelete: SubmissionDeleteService,
    @InjectRepository(VisitorEntity)
    private readonly visitorRepository: Repository<VisitorEntity>,
  ) {
  }

  async delete(id: number): Promise<void> {
    // Delete dependent submissions first (they may have deep relations)
    const submissions = await this.submissionRepository.find({
      form: { id },
    })
    await Promise.all(
      submissions.map(submission => this.submissionDelete.delete(submission.id)),
    )

    // Delete visitors referencing this form
    await this.visitorRepository.delete({
      form: { id },
    })

    // Soft delete: mark form as inactive instead of removing the row
    const form = await this.formRepository.findOne(id)
    if (form) {
      form.is_active = false
      await this.formRepository.save(form)
    }
  }
}
