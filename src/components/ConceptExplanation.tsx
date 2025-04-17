'use client'

import React, { useState } from 'react'

const ConceptExplanation: React.FC = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 mb-10 shadow-sm'>
      <div className='flex justify-between items-start'>
        <div>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>Como funciona?</h2>
          <p className='text-gray-600 mb-4'>
            Transformamos designs do Figma em representações estruturadas que podem ser usadas por
            ferramentas de IA para implementação de código.
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className='text-blue-600 hover:text-blue-800 font-medium'
        >
          {expanded ? 'Ver menos' : 'Saiba mais'}
        </button>
      </div>

      {expanded && (
        <div className='mt-4 border-t border-blue-100 pt-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='text-blue-500 text-2xl mb-2'>1</div>
              <h3 className='font-bold text-gray-800 mb-2'>Extração do Design</h3>
              <p className='text-gray-600 text-sm'>
                Conectamos com a API do Figma para extrair todos os detalhes do seu design,
                incluindo cores, tamanhos, hierarquia de componentes e posicionamento.
              </p>
            </div>

            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='text-blue-500 text-2xl mb-2'>2</div>
              <h3 className='font-bold text-gray-800 mb-2'>Transformação em AST</h3>
              <p className='text-gray-600 text-sm'>
                Convertemos os dados brutos do Figma em uma Abstract Syntax Tree (AST) estruturada e
                semântica que representa seu design de forma <strong>completa e fiel</strong>. A AST
                preserva toda a hierarquia do documento, incluindo todos os frames e componentes.
              </p>
            </div>

            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <div className='text-blue-500 text-2xl mb-2'>3</div>
              <h3 className='font-bold text-gray-800 mb-2'>Integração com Ferramentas</h3>
              <p className='text-gray-600 text-sm'>
                A representação estruturada é formatada para integração com ferramentas como Cursor
                e Windsurf, oferecendo contexto rico para implementação de código.
              </p>
            </div>
          </div>

          <div className='mt-6 bg-white rounded-lg p-5 shadow-sm'>
            <h3 className='font-bold text-gray-800 mb-2'>Benefícios dessa Abordagem</h3>
            <ul className='grid grid-cols-1 md:grid-cols-2 gap-3 list-disc pl-5'>
              <li className='text-gray-600'>Entendimento semântico do design pela IA</li>
              <li className='text-gray-600'>Implementação mais precisa e contextualizada</li>
              <li className='text-gray-600'>Redução da necessidade de especificações manuais</li>
              <li className='text-gray-600'>Conexão direta entre design e desenvolvimento</li>
              <li className='text-gray-600'>Maior consistência entre design e código final</li>
              <li className='text-gray-600'>Fluxo de trabalho mais eficiente e ágil</li>
            </ul>
          </div>

          <div className='mt-4 text-sm text-gray-500'>
            Este método contrasta com a abordagem tradicional de gerar código diretamente do Figma,
            que muitas vezes resulta em código rígido e não otimizado. Ao usar a representação AST
            estruturada, ferramentas de IA podem implementar o design com mais flexibilidade e
            contexto, seguindo as melhores práticas de código.
          </div>
        </div>
      )}
    </div>
  )
}

export default ConceptExplanation
