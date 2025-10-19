import { Button } from 'antd'
import { ButtonProps } from 'antd/lib/button/button'
import { darken, lighten } from 'polished'
import React from 'react'
import styled from 'styled-components'

interface Props extends ButtonProps {
  background: string
  highlight: string
  color: string
}

// Safe darken/lighten with fallback for null colors
const safeDarken = (amount: number, color: string | null): string => {
  return color ? darken(amount, color) : '#cccccc'
}

const safeLighten = (amount: number, color: string | null): string => {
  return color ? lighten(amount, color) : '#f0f0f0'
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
const Styled = styled(Button)`
  background: ${(props: Props) => props.background || '#1890ff'};
  color: ${(props: Props) => props.color || '#ffffff'};
  border-color: ${(props: Props) => safeDarken(0.1, props.background)};

  :hover {
    color: ${(props: Props) => props.highlight || '#40a9ff'};
    background-color: ${(props: Props) => safeLighten(0.1, props.background)};
    border-color: ${(props: Props) => safeDarken(0.1, props.highlight)};
  }
`

export const StyledButton: React.FC<Props> = ({ children, ...props }) => {
  return <Styled {...props}>{children}</Styled>
}
