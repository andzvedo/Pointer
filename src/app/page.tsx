'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Copy } from 'lucide-react' // Import icons
import FigmaNodeViewer from '@/components/FigmaNodeViewer' // Import the new component

// Define possible states for the component
type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export default function FigmaFetcherPage() {
  const [figmaUrl, setFigmaUrl] = useState<string>('')
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [fetchedData, setFetchedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('') // To store the file name from the response

  const handleFetchData = async () => {
    if (!figmaUrl) {
      setError('Please enter a valid Figma Node URL.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setError(null)
    setFetchedData(null)
    setFileName('')

    try {
      const response = await fetch(`/api/figma?figmaUrl=${encodeURIComponent(figmaUrl)}`)

      if (!response.ok) {
        let errorMsg = `Request failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.details || errorData.error || errorMsg;
        } catch { /* Ignore if error body is not JSON */ }
        throw new Error(errorMsg);
      }

      const data = await response.json()
      setFetchedData(data)
      setFileName(data.name || 'Figma Node') // Use node name as file name
      setStatus('success')

    } catch (err: any) {
      console.error("Fetch error:", err)
      setError(err.message || 'An unexpected error occurred.')
      setStatus('error')
    }
  }

  const handleCopyJson = () => {
    if (fetchedData) {
      navigator.clipboard.writeText(JSON.stringify(fetchedData, null, 2))
        .then(() => {
          // Optional: Show a temporary success message or change button state
          console.log('JSON copied to clipboard!')
        })
        .catch(err => {
          console.error('Failed to copy JSON:', err)
          // Optional: Show an error message
        })
    }
  }
  
  const handleReset = () => {
      setFigmaUrl('');
      setStatus('idle');
      setFetchedData(null);
      setError(null);
      setFileName('');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      {status !== 'success' ? (
        // Card for Initial state, Loading, Error
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect to Figma</CardTitle>
            <CardDescription>
              Paste the URL of the Figma node you want to inspect.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="url"
                placeholder="Enter your Figma Node URL here" 
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                disabled={status === 'loading'}
              />
              {status === 'error' && error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleFetchData}
                disabled={status === 'loading'}
                className="w-full"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <span>Fetch Node Data</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Card for Success state (Data Extracted)
        <Card className="w-full max-w-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle>Figma Node: {fileName}</CardTitle>
                <CardDescription>Node data loaded. Preview below.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>Fetch New URL</Button>
          </CardHeader>
          <CardContent>
            <FigmaNodeViewer nodeData={fetchedData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
