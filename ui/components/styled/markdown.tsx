import { lighten } from 'polished'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown'
import styled from 'styled-components'
import { FormPublicDesignFragment } from '../types/form.public.types'

interface Props extends ReactMarkdownOptions {
  type: 'question' | 'answer'
  design: FormPublicDesignFragment
}

const getColor = (props: Props) => {
  const color = props.type === 'question' ? props.design.colors.question : props.design.colors.answer
  return color || (props.type === 'question' ? '#1890ff' : '#000000')
}

// Safe lighten with fallback for null colors
const safeLighten = (amount: number, color: string | null): string => {
  return color ? lighten(amount, color) : '#f0f0f0'
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
const Markdown = styled(ReactMarkdown)`
  color: ${getColor};

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  span,
  div {
    color: ${getColor};
  }

  blockquote {
    color: ${(props: Props) => safeLighten(0.5, getColor(props))};
    padding-left: 20px;
    border-left: 10px rgba(0, 0, 0, 0.05) solid;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;

    tr {
      border-top: 1px solid ${getColor};

      th,
      td {
        padding: 6px 13px;
        border: 1px solid ${getColor};
      }
    }

    tr:nth-child(2n) {
      background: rgba(0, 0, 0, 0.05);
    }
  }
`

export const StyledMarkdown: React.FC<Props> = ({ children, ...props }) => {
  return (
    <Markdown {...props}>
      {children}
    </Markdown>
  )
}
