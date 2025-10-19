import { InputNumber } from 'antd'
import { InputNumberProps } from 'antd/lib/input-number'
import { transparentize } from 'polished'
import React from 'react'
import styled from 'styled-components'
import { FormPublicDesignFragment } from '../types/form.public.types'

interface Props extends InputNumberProps {
  design: FormPublicDesignFragment
}

// Safe transparentize with fallback for null colors
const safeTransparentize = (amount: number, color: string | null): string => {
  return color ? transparentize(amount, color) : 'rgba(0, 0, 0, 0.4)'
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
const Field = styled(InputNumber)`
  color: ${(props: Props) => props.design.colors.answer || '#000000'};
  border-color: ${(props: Props) => props.design.colors.answer || '#d9d9d9'};
  background: none !important;
  border-right: none;
  border-top: none;
  border-left: none;
  border-radius: 0;
  width: 100%;

  :focus {
    outline: ${(props: Props) => props.design.colors.answer || '#1890ff'} auto 5px;
  }

  :hover,
  :active {
    border-color: ${(props: Props) => props.design.colors.answer || '#40a9ff'};
  }

  &.ant-input-number {
    box-shadow: none;
  }

  input {
    background: none !important;
    color: ${(props: Props) => props.design.colors.answer || '#000000'};

    ::placeholder {
      color: ${(props: Props) => safeTransparentize(0.6, props.design.colors.answer)};
    }
  }

  .anticon {
    color: ${(props: Props) => props.design.colors.answer || '#000000'};
  }
`

export const StyledNumberInput: React.FC<Props> = ({ children, ...props }) => {
  return <Field {...props}>{children}</Field>
}
