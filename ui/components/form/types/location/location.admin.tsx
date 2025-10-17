import { Alert, Form, Input, InputNumber, Space } from 'antd'
import React from 'react'
import dynamic from 'next/dynamic'
import type { MapContainerProps, TileLayerProps } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
const MapContainer = dynamic<MapContainerProps>(
  () => import('react-leaflet').then(m => m.MapContainer as any),
  { ssr: false },
)
const TileLayer = dynamic<TileLayerProps>(
  () => import('react-leaflet').then(m => m.TileLayer as any),
  { ssr: false },
)
const DraggableMarker = dynamic(() => import('../../../map/draggable.marker').then(m => m.DraggableMarker), { ssr: false })
import { FieldAdminProps } from '../field.admin.props'

export const LocationAdmin: React.FC<FieldAdminProps> = (props) => {
  const { t } = useTranslation()

  return (
    <div>
      <Form.Item
        label={t('type:location:default')}
        labelCol={{ span: 6 }}
      >
        <Space>
          <Form.Item
            name={[
              props.field.name as string,
              'defaultValue',
              'lat',
            ]}
            noStyle
          >
            <InputNumber addonAfter={'LAT'} precision={7} step={0.00001} max={90} min={-90} />
          </Form.Item>

          <Form.Item
            name={[
              props.field.name as string,
              'defaultValue',
              'lng',
            ]}
            noStyle
          >
            <InputNumber addonAfter={'LNG'} precision={7} step={0.00001} max={180} min={-180} />
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item
        label={t('type:location.initialZoom')}
        name={[
          props.field.name as string,
          'optionKeys',
          'initialZoom',
        ]}
        labelCol={{ span: 6 }}
        initialValue={1}
      >
        <InputNumber precision={0} min={1} max={18} />
      </Form.Item>

      <Form.Item
        label={t('type:location.tiles')}
        name={[
          props.field.name as string,
          'optionKeys',
          'tiles',
        ]}
        labelCol={{ span: 6 }}
        initialValue={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
      >
        <Input placeholder={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} />
      </Form.Item>

      <Form.Item shouldUpdate>
        {(form) => {
          //const prefix = React.useContext(FormItemContext).prefixName
          const prefix = (form as any).prefixName

          const zoom = form.getFieldValue([
            ...prefix,
            props.field.name as string,
            'optionKeys',
            'initialZoom',
          ])

          const center = form.getFieldValue([
            ...prefix,
            props.field.name as string,
            'defaultValue',
          ])

          const tiles = form.getFieldValue([
            ...prefix,
            props.field.name as string,
            'optionKeys',
            'tiles',
          ])

          if (!tiles) {
            return <Alert message={'Tiles missing!'} />
          }

          const hasWindow = typeof window !== 'undefined'
          const validLat = center && typeof center.lat === 'number' && isFinite(center.lat)
          const validLng = center && typeof center.lng === 'number' && isFinite(center.lng)
          const safeCenter = validLat && validLng ? center : { lat: 0, lng: 0 }
          const safeZoom = Number.isFinite(zoom) ? zoom : 2

          const toLatLngTuple = (
            c?: { lat?: unknown; lng?: unknown },
            fallback = { lat: 0, lng: 0 },
          ): [number, number] => {
            const lat = Number.isFinite(Number(c?.lat)) ? Number(c?.lat) : fallback.lat
            const lng = Number.isFinite(Number(c?.lng)) ? Number(c?.lng) : fallback.lng
            return [lat, lng]
          }

          return (
            <div>
              {hasWindow && (
                <MapContainer
                  center={toLatLngTuple(safeCenter)}
                  zoom={safeZoom as number}
                  style={{ height: 300, width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={tiles}
                  />
                  {validLat && validLng && (
                    <DraggableMarker
                      value={safeCenter}
                      onChange={next => {
                        form.setFields([
                          {
                            name: [
                              ...prefix,
                              props.field.name as string,
                              'defaultValue',
                              'lng',
                            ],
                            value: next.lng,
                          },
                          {
                            name: [
                              ...prefix,
                              props.field.name as string,
                              'defaultValue',
                              'lat',
                            ],
                            value: next.lat,
                          },
                        ])
                      }}
                    />
                  )}
                </MapContainer>
              )}
            </div>
          )
        }}
      </Form.Item>
    </div>
  )
}
