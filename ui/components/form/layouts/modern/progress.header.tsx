import { ArrowLeftOutlined } from '@ant-design/icons'
import React from 'react'
import styled from 'styled-components'

interface Props {
  current: number
  total: number
  progress: number
  onBack?: () => void
}

const Header = styled.div`
  width: 100%;
  max-width: 680px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`

const BackButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const ProgressContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 14px;
  font-weight: 500;
`

const ProgressBarTrack = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
`

const ProgressBarFill = styled.div<{ progress: number }>`
  height: 100%;
  background: white;
  border-radius: 999px;
  width: ${props => props.progress}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`

const ModernProgressHeaderComponent: React.FC<Props> = ({ 
  current, 
  total, 
  progress,
  onBack 
}) => {
  return (
    <Header>
      {onBack && (
        <BackButton onClick={onBack} aria-label="Go back">
          <ArrowLeftOutlined />
        </BackButton>
      )}
      
      <ProgressContainer>
        <ProgressInfo>
          <span>Question {current} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </ProgressInfo>
        <ProgressBarTrack>
          <ProgressBarFill progress={progress} />
        </ProgressBarTrack>
      </ProgressContainer>
    </Header>
  )
}

export const ModernProgressHeader = React.memo(ModernProgressHeaderComponent)
