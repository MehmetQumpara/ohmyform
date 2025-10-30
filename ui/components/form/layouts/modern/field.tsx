import React from 'react'
import styled from 'styled-components'
import {
  FormPublicDesignFragment,
  FormPublicFieldFragment,
} from '../types/form.public.types'
import { useRouter } from '../../../use.router'
import { fieldTypes } from '../../types'

interface Props {
  focus?: boolean
  field: FormPublicFieldFragment
  design: FormPublicDesignFragment
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const QuestionNumber = styled.div`
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 12px 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`

const Description = styled.div`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
  margin: 0 0 24px 0;
  line-height: 1.6;
  
  p {
    margin: 0 0 12px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
`

const RequiredBadge = styled.span`
  color: #ff4d4f;
  margin-left: 4px;
`

const ModernFieldComponent: React.FC<Props> = ({ field, design, focus }) => {
  const router = useRouter()

  const FieldInput = (fieldTypes[field.type] || fieldTypes['text']).inputFormField()

  const getUrlDefault = (): string => {
    if (router.query[field.id]) {
      return router.query[field.id] as string
    }

    if (router.query[field.slug]) {
      return router.query[field.slug] as string
    }

    return undefined
  }

  return (
    <Container>
      <div>
        <QuestionNumber>Question</QuestionNumber>
        <Title>
          {field.title}
          {field.required && <RequiredBadge>*</RequiredBadge>}
        </Title>
        {field.description && (
          <Description 
            dangerouslySetInnerHTML={{ __html: field.description }}
          />
        )}
      </div>

      <FieldInput
        design={design}
        field={field}
        urlValue={getUrlDefault()}
        focus={focus}
      />
    </Container>
  )
}

export const ModernField = React.memo(ModernFieldComponent)
