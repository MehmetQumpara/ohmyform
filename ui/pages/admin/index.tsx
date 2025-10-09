import { Col, Row, Statistic } from 'antd'
import Structure from 'components/structure'
import { withAuth } from 'components/with.auth'
import { NextPage } from 'next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminStatistics } from '../../hooks/useAdminStatistics'

const Index: NextPage = () => {
  const { t } = useTranslation()
  const { data, loading } = useAdminStatistics()

  return (
    <Structure title={t('admin:home')} selected={'home'} loading={loading}>
      <Row gutter={16}>
        <Col sm={8} xs={24}>
          <Statistic title={t('statistic:totalForms')} value={data && data.forms.total} />
        </Col>

        <Col sm={8} xs={24}>
          <Statistic title={t('statistic:totalUsers')} value={data && data.users.total} />
        </Col>

        <Col sm={8} xs={24}>
          <Statistic
            title={t('statistic:totalSubmissions')}
            value={data && data.submissions.total}
          />
        </Col>
      </Row>
    </Structure>
  )
}

export default withAuth(Index, ['admin'])
