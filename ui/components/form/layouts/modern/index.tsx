import { Form, message, Spin } from 'antd'
import debug from 'debug'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useMath } from '../../../use.math'
import { LayoutProps } from '../layout.props'
import { ModernField } from './field'
import { ModernProgressHeader } from './progress.header'
import { ModernWelcomePage } from './welcome.page'
import { ModernThankYouPage } from './thankyou.page'
import { ModernNavigationBar } from './navigation.bar'

type Step = 'start' | 'form' | 'end'

const logger = debug('layout/modern')

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`

const FormCard = styled.div`
  width: 100%;
  max-width: 680px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px;
  margin: 24px 0;
  animation: slideUp 0.4s ease-out;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 16px;
    margin: 16px 0;
  }
`

export const ModernLayout: React.FC<LayoutProps> = (props) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [step, setStep] = useState<Step>(props.form.startPage?.show ? 'start' : 'form')
  const [loading, setLoading] = useState(false)
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)

  const { fields, startPage, endPage, design } = props.form
  const { setField } = props.submission

  // Filter visible fields
  const visibleFields = fields.filter(field => field.type !== 'hidden')
  const currentField = visibleFields[currentFieldIndex]
  const totalFields = visibleFields.length
  const progress = totalFields > 0 ? ((currentFieldIndex + 1) / totalFields) * 100 : 0

  const updateValues = useCallback(() => {
    const values = form.getFieldsValue()
    logger('values changed %O', values)
  }, [form])

  useEffect(() => {
    updateValues()
  }, [updateValues])

  const saveCurrentField = async () => {
    if (!currentField) return true

    try {
      const values = form.getFieldsValue()
      const fieldValue = values[currentField.id]
      
      // Only save if field has a value
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        await setField(currentField.id.toString(), fieldValue)
      }
      return true
    } catch (error) {
      logger('error saving field %O', error)
      return false // Return false to prevent navigation if save fails
    }
  }

  const handleNext = async () => {
    if (!currentField) return

    try {
      // Validate current field
      await form.validateFields([currentField.id.toString()])

      // Save field
      setLoading(true)
      const saved = await saveCurrentField()
      setLoading(false)

      if (!saved) {
        void message.error(t('form:errorSubmitting'))
        return
      }

      // Move to next
      if (currentFieldIndex < totalFields - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1)
      } else {
        await handleFinish()
      }
    } catch (error) {
      setLoading(false)
      logger('validation error %O', error)
    }
  }

  const handleBack = async () => {
    // Save current field before going back (without validation)
    await saveCurrentField()

    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1)
    } else if (startPage?.show) {
      setStep('start')
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await props.submission.finish()
      
      if (endPage?.show) {
        setStep('end')
      } else {
        void message.success({
          content: t('form:submitted'),
          duration: 3,
        })
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (e) {
      logger('failed to finish form %O', e)
      void message.error({
        content: t('form:errorSubmitting'),
      })
    }
    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  const renderContent = () => {
    switch (step) {
      case 'start':
        return (
          <ModernWelcomePage
            page={startPage}
            design={design}
            onStart={() => setStep('form')}
          />
        )

      case 'form':
        return (
          <>
            <ModernProgressHeader
              current={currentFieldIndex + 1}
              total={totalFields}
              progress={progress}
              onBack={handleBack}
            />

            <FormCard>
              <Form
                form={form}
                onFinish={handleFinish}
                onKeyPress={handleKeyPress}
              >
                {currentField && (
                  <ModernField
                    key={currentField.id}
                    field={currentField}
                    design={design}
                    focus={true}
                  />
                )}
              </Form>
            </FormCard>

            <ModernNavigationBar
              showBack={currentFieldIndex > 0 || startPage?.show}
              nextLabel={currentFieldIndex === totalFields - 1 ? t('form:submit') : t('form:next')}
              onBack={handleBack}
              onNext={handleNext}
              loading={loading}
            />
          </>
        )

      case 'end':
        return (
          <ModernThankYouPage
            page={endPage}
            design={design}
            showRestart={props.form.allowRestart}
            onRestart={() => window.location.reload()}
          />
        )
    }
  }

  return (
    <Container>
      <Spin spinning={loading} size="large">
        <ContentWrapper>
          {renderContent()}
        </ContentWrapper>
      </Spin>
    </Container>
  )
}
