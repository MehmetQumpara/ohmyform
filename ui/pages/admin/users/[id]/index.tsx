import { Button, Form, Input, message, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import Structure from 'components/structure'
import { withAuth } from 'components/with.auth'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cleanInput } from '../../../../components/clean.input'
import { BaseDataTab } from '../../../../components/user/admin/base.data.tab'
import { useUserQuery } from '../../../../hooks/useUserQuery'
import { useUserUpdate } from '../../../../hooks/useUserUpdate'

interface FormData {
  user: any
}

const Index: NextPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [form] = useForm()
  const [saving, setSaving] = useState(false)

  const { data, loading } = useUserQuery({
    variables: {
      id: router.query.id as string,
    },
    onCompleted: (next) => {
      form.setFieldsValue(next)
    },
  })

  const { updateUser } = useUserUpdate()

  const save = async (formData: FormData) => {
    setSaving(true)
    try {
      const cleanedData = cleanInput(formData)
      const updatedUser = await updateUser(cleanedData.user)

      if (updatedUser) {
        form.setFieldsValue({ user: updatedUser })
        await message.success(t('user:updated'))
      } else {
        throw new Error('Update failed')
      }
    } catch (e) {
      console.error('failed to save', e)
      await message.error(t('user:updateError'))
    }

    setSaving(false)
  }

  return (
    <Structure
      loading={loading || saving}
      title={loading ? t('user:loading') : data ? t('user:mange', { email: data.user.email }) : ''}
      selected={'users'}
      breadcrumbs={[
        { href: '/admin', name: t('admin:home') },
        { href: '/admin/users', name: t('admin:users') },
      ]}
      extra={[
        <Button key={'save'} onClick={form.submit} type={'primary'}>
          {t('user:updateNow')}
        </Button>,
      ]}
      style={{ paddingTop: 0 }}
    >
      <Form
        form={form}
        onFinish={save}
        onFinishFailed={async () => {
          // TODO process errors
          await message.error(t('validation:mandatoryFieldsMissing'))
        }}
        labelCol={{
          xs: { span: 24 },
          sm: { span: 6 },
        }}
        wrapperCol={{
          xs: { span: 24 },
          sm: { span: 18 },
        }}
      >
        <Form.Item noStyle name={['user', 'id']}>
          <Input type={'hidden'} />
        </Form.Item>

        <Tabs>
          <BaseDataTab key={'base_data'} tab={t('user:baseData')} />
        </Tabs>
      </Form>
    </Structure>
  )
}

export default withAuth(Index, ['admin'])
