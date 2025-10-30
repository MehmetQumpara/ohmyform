import { ArrowRightOutlined } from '@ant-design/icons'
import React from 'react'
import styled from 'styled-components'
import {
  FormPublicDesignFragment,
  FormPublicPageFragment,
} from '../types/form.public.types'

interface Props {
  page?: FormPublicPageFragment
  design: FormPublicDesignFragment
  onStart: () => void
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

const Emoji = styled.div`
  font-size: 72px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 56px;
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

const StartButton = styled.button`
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 14px 32px;
    font-size: 16px;
  }
`

const ModernWelcomePageComponent: React.FC<Props> = ({
  page,
  design,
  onStart
}) => {
  const title = page?.title || 'Welcome'
  const description = page?.paragraph
  const buttonText = (page as any)?.buttonText || 'Start Form'
  
  return (
    <Container>
      <Emoji>👋</Emoji>
      <Title>{title}</Title>
      {description && <Description dangerouslySetInnerHTML={{ __html: description }} />}
      <StartButton onClick={onStart}>
        {buttonText}
        <ArrowRightOutlined />
      </StartButton>
    </Container>
  )
}

export const ModernWelcomePage = React.memo(ModernWelcomePageComponent)
