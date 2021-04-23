import HTTPStatus from 'http-status'
import { Row, Button } from 'antd'
import styled from 'styled-components'

import AnimatedBG from './styles'
import { PublicRoutes } from '@utils'
import React from 'react'

const Content = styled.div`
  max-width: 400px;
  z-index: 2;
  min-width: 300px;
  h1 {
    font-size: 10rem;
  }
`

const BoldHeading = styled.h1`
    font-weight: 900
`

type NotFoundProps = {
    code: keyof HTTPStatus.HttpStatus
}

export const NotFound = ({ code }: NotFoundProps) => {
    const loginButton = (code === '401')
        ? <Button href={PublicRoutes.Logout.getPath()}>Back to login</Button>
        : undefined

    const getTitle = (code: keyof HTTPStatus.HttpStatus): HTTPStatus.HttpStatus[keyof HTTPStatus.HttpStatus] => {
        switch (code) {
            case '404':
                return 'This page could not be found'
            case '503':
                return 'A critical error occured. Please contact Okra support immediately.'
            default:
                return HTTPStatus[code] || 'An unexpected error has occurred'
        }
    }

    return (
        <Row
            align='middle'
            justify='center'
            className='bg-white text-center'
            style={{ minHeight: '100vh' }}
        >
            <Content>
                <BoldHeading
                    className={'text-error mb-0'}
                >
                    {code}
                </BoldHeading>
                <h6 className='mb-1 mt-1 text-body'>{getTitle(code)} </h6>
                <br />
                {loginButton}
            </Content>

            {/* Don't show animation when login button is showing, otherwise button can't be clicked */}
            {loginButton
                ? undefined
                : (
                    <AnimatedBG>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(item => (
                            <span key={item} />
                        ))}
                    </AnimatedBG>
                )
            }
        </Row>
    )
}
