import { DatePicker } from 'antd'
import { PickerProps } from 'antd/lib/date-picker/generatePicker'
import { Moment } from 'moment'
import { transparentize } from 'polished'
import React from 'react'
import styled from 'styled-components'
import { FormPublicDesignFragment } from '../types/form.public.types'

type Props = { design: FormPublicDesignFragment } & PickerProps<Moment>

// Safe transparentize with fallback for null colors
const safeTransparentize = (amount: number, color: string | null): string => {
  return color ? transparentize(amount, color) : 'rgba(0, 0, 0, 0.4)'
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
const Field = styled(DatePicker)`
  color: ${(props: Props) => props.design.colors.answer || '#000000'};
  border-color: ${(props: Props) => props.design.colors.answer || '#d9d9d9'};
  background: none !important;
  border-right: none;
  border-top: none;
  border-left: none;
  border-radius: 0;
  width: 100%;

  :hover,
  :active {
    border-color: ${(props: Props) => props.design.colors.answer || '#40a9ff'};
  }

  &.ant-picker {
    box-shadow: none;
  }

  .ant-picker-clear {
    background: none;
  }

  input {
    color: ${(props: Props) => props.design.colors.answer || '#000000'};

    ::placeholder {
      color: ${(props: Props) => safeTransparentize(0.6, props.design.colors.answer)};
    }
  }

  .anticon {
    color: ${(props: Props) => props.design.colors.answer || '#000000'};
  }
`

export const StyledDateInput: React.FC<Props> = ({ children, ...props }) => {
  return <Field {...props}>{children}</Field>
}
