import { ArrowRightOutlined } from '@ant-design/icons'
import React from 'react'
import styled from 'styled-components'

interface Props {
  showBack?: boolean
  showNext?: boolean
  nextLabel?: string
  loading?: boolean
  onBack?: () => void
  onNext?: () => void
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`

const Button = styled.button<{ variant?: 'secondary' | 'primary' }>`
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.variant === 'secondary' ? `
    background: rgba(0, 0, 0, 0.04);
    color: rgba(0, 0, 0, 0.65);
    
    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  ` : `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const Spacer = styled.div`
  flex: 1;
`

const ModernNavigationBarComponent: React.FC<Props> = ({
  showBack = false,
  showNext = true,
  nextLabel = 'Continue',
  loading = false,
  onBack,
  onNext
}) => {
  return (
    <Container>
      {showBack && onBack ? (
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      ) : (
        <Spacer />
      )}
      
      {showNext && onNext && (
        <Button variant="primary" onClick={onNext} disabled={loading}>
          {loading ? 'Loading...' : nextLabel}
          {!loading && <ArrowRightOutlined />}
        </Button>
      )}
    </Container>
  )
}

export const ModernNavigationBar = React.memo(ModernNavigationBarComponent)
