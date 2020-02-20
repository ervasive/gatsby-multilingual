import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

export const query = graphql`
  query {
    allGpmlTranslation {
      nodes {
        id
        value
        messageId
        priority
        language
      }
    }
  }
`

const Index = ({ data }) => {
  return (
    <div>
      <h1>Registered translations:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

Index.propTypes = {
  data: PropTypes.object,
}

export default Index
