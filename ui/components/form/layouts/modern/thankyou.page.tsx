import { CheckCircleFilled, ReloadOutlined } from '@ant-design/icons'
import React from 'react'
import styled from 'styled-components'
import {
  FormPublicDesignFragment,
  FormPublicPageFragment,
} from '../types/form.public.types'

interface Props {
  page?: FormPublicPageFragment
  design: FormPublicDesignFragment
  showRestart?: boolean
  onRestart?: () => void
}

const Container = styled.div`
  padding: 48px 40px;
  text-align: center;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    min-height: 320px;
  }
`

const IconWrapper = styled.div`
  font-size: 80px;
  color: #52c41a;
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
  
  @keyframes scaleIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 64px;
    margin-bottom: 20px;
  }
`

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 16px 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`

const Description = styled.p`
  font-size: 18px;
  color: rgba(0, 0, 0, 0.65);
  margin: 0 0 40px 0;
  line-height: 1.6;
  max-width: 500px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 32px;
  }
`

const RestartButton = styled.button`
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.65);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 12px 28px;
    font-size: 15px;
  }
`

const ModernThankYouPageComponent: React.FC<Props> = ({
  page,
  design,
  showRestart = false,
  onRestart
}) => {
  const title = page?.title || 'Thank You!'
  const description = page?.paragraph || 'Your response has been submitted successfully.'
  
  return (
    <Container>
      <IconWrapper>
        <CheckCircleFilled />
      </IconWrapper>
      <Title>{title}</Title>
      <Description dangerouslySetInnerHTML={{ __html: description }} />
      {showRestart && onRestart && (
        <RestartButton onClick={onRestart}>
          <ReloadOutlined />
          Restart Form
        </RestartButton>
      )}
    </Container>
  )
}

export const ModernThankYouPage = React.memo(ModernThankYouPageComponent)
