import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FormEntity } from '../../entity/form.entity'

@Injectable()
export class FormDeleteService {
  constructor(
    @InjectRepository(FormEntity)
    private readonly formRepository: Repository<FormEntity>,
  ) {
  }

  async delete(id: number): Promise<void> {
    // Find the form first
    const form = await this.formRepository.findOne({
      where: { id },
    })

    if (!form) {
      throw new Error(`Form with id ${id} not found`)
    }

    // Check if already soft deleted
    if (!form.is_active) {
      return
    }

    // Soft delete: mark form as inactive instead of removing the row
    form.is_active = false
    await this.formRepository.save(form)

    // Note: Related submissions and visitors are kept for data integrity
    // They can be filtered by checking the parent form's is_active status
  }
}
