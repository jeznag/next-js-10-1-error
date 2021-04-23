import { NextPageContext } from 'next'
import { NotFound } from 'shared/components'

type Props = {
    statusCode: number
}

const Error = ({ statusCode }: Props) => {
    return (
        <div>{statusCode && <NotFound code={statusCode.toString()} />}</div>
    )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error
