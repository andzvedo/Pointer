'use client'

import React, { useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

SyntaxHighlighter.registerLanguage('json', json)

interface JsonViewerProps {
  data: any
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className='w-full bg-white rounded-lg shadow-lg'>
      <div className='p-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-semibold'>Dados do Figma</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='px-4 py-2 text-sm text-blue-500 hover:text-blue-600'
          >
            {isExpanded ? 'Minimizar' : 'Expandir'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className='p-4 max-h-[500px] overflow-auto'>
          <SyntaxHighlighter
            language='json'
            style={docco}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            {JSON.stringify(data, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}

export default JsonViewer
