'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Copy, Info } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Helper function to convert Figma color (0-1 range) to CSS rgba string
function figmaColorToCss(color?: { r: number; g: number; b: number; a: number }): string {
    if (!color) return 'transparent';
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
}

// Interface for a Frame node (keep properties minimal for now)
interface FigmaFrameNode {
    id: string;
    name: string;
    type: 'FRAME';
    absoluteBoundingBox: { width: number; height: number };
    fills?: ReadonlyArray<any>;
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export default function FigmaExtractorPage() {
  const [figmaUrl, setFigmaUrl] = useState<string>('')
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [frames, setFrames] = useState<FigmaFrameNode[]>([])
  const [selectedFrame, setSelectedFrame] = useState<FigmaFrameNode | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetchData = async () => {
    if (!figmaUrl) {
      setError('Please enter a valid Figma File URL.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError(null);
    setFrames([]);
    setSelectedFrame(null);

    try {
      const response = await fetch(`/api/figma?figmaUrl=${encodeURIComponent(figmaUrl)}`)
      if (!response.ok) {
        let errorMsg = `Request failed: ${response.status}`;
        try { const data = await response.json(); errorMsg = data.details || data.error || errorMsg; } catch {} 
        throw new Error(errorMsg);
      }
      const data = await response.json()
      if (!Array.isArray(data)) {
          throw new Error('API did not return an array of frames.');
      }
      setFrames(data as FigmaFrameNode[]);
      setStatus('success');
      if (data.length > 0) {
          setSelectedFrame(data[0]);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const handleCopyJson = useCallback(() => {
      if (selectedFrame) {
          navigator.clipboard.writeText(JSON.stringify(selectedFrame, null, 2))
              .then(() => console.log('JSON copied!'))
              .catch(err => console.error('Failed to copy JSON:', err));
      }
  }, [selectedFrame]);

  // State 1 & 2: Idle and Loading
  if (status === 'idle' || status === 'loading' ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Extract data from Figma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                 <label className="text-sm font-medium text-gray-700 absolute -top-2 left-2 bg-white px-1">Figma URL</label>
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" title="Paste the full URL of your Figma file.">
                   <Info className="h-4 w-4" />
                 </span>
                 <Input
                    type="url"
                    placeholder="Enter Figma URL here"
                    className="border-gray-300 pt-3"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    disabled={status === 'loading'}
                  />
              </div>
              
              <Button onClick={handleFetchData} disabled={status === 'loading'} className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Extracting...</span> 
                  </>
                ) : (
                  <span>Extract data</span> 
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State 3: Error occurred during fetch
  if (status === 'error') {
    return (
       <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Extract data from Figma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                 <label className="text-sm font-medium text-gray-700 absolute -top-2 left-2 bg-white px-1">Figma URL</label>
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" title="Paste the full URL of your Figma file.">
                   <Info className="h-4 w-4" />
                 </span>
                 <Input
                    type="url"
                    placeholder="Enter Figma URL here"
                    className="border-gray-300 pt-3" 
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                  />
              </div>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || 'Could not fetch data.'}</AlertDescription>
              </Alert>
              <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State 4: Success (Data Extracted Layout)
  return (
    <div className="flex h-screen bg-white">
      <aside className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4">
          <div>
              <label htmlFor="figmaUrlDisplay" className="text-xs font-medium text-gray-500 flex items-center justify-between mb-1">
                  <span>Figma URL</span>
                  <span className="cursor-pointer" title="The URL of the Figma file being displayed.">
                    <Info className="h-3 w-3 text-gray-400" />
                  </span>
              </label>
              <Input 
                  id="figmaUrlDisplay"
                  type="text" 
                  value={figmaUrl} 
                  readOnly 
                  className="w-full border-gray-300 bg-gray-50 text-xs h-8 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
          </div>

          {selectedFrame ? (
            <div className="flex-grow overflow-y-auto border rounded-md p-3 bg-white space-y-3">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <h3 className="text-sm font-semibold truncate" title={selectedFrame.name}>{selectedFrame.name}</h3>
                  <Button variant="ghost" size="icon" onClick={handleCopyJson} title="Copy JSON" className="h-6 w-6">
                      <Copy className="h-4 w-4 text-gray-500" />
                  </Button>
              </div>
              <div className="space-y-1">
                  <p className="text-xs text-gray-600">Type: <span className="font-medium text-gray-800">{selectedFrame.type}</span></p>
                  <p className="text-xs text-gray-600">Dimensions: <span className="font-medium text-gray-800">{selectedFrame.absoluteBoundingBox.width.toFixed(0)} x {selectedFrame.absoluteBoundingBox.height.toFixed(0)}</span></p>
              </div>
              <Textarea
                  readOnly
                  value={JSON.stringify(selectedFrame, null, 2)}
                  className="w-full h-56 font-mono text-xs resize-none bg-gray-50 border-gray-300 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-sm text-gray-400 border rounded-md bg-gray-50">
                Select a frame to see details.
            </div>
          )}
      </aside>

      <main className="flex-1 flex flex-col bg-gray-50">
          <header className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
              <h1 className="text-base font-semibold">Preview</h1>
              <Button 
                  onClick={() => { setStatus('idle'); setFrames([]); setSelectedFrame(null); setFigmaUrl(''); }} 
                  className="bg-gray-800 hover:bg-gray-700 text-white h-8 px-3 text-sm"
              >
                 + New extraction
              </Button>
          </header>

          <div className="flex-grow p-6 overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {frames.map((frame) => {
                      const solidFill = frame.fills?.find(fill => fill.type === 'SOLID' && fill.color);
                      const bgColor = figmaColorToCss(solidFill?.color);
                      const isSelected = selectedFrame?.id === frame.id;
                      
                      return (
                          <div 
                              key={frame.id} 
                              className={`bg-white rounded-lg overflow-hidden cursor-pointer shadow border transition-all duration-150 ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200 hover:shadow-md'}`}
                              onClick={() => setSelectedFrame(frame)}
                          >
                              <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                                  <span className="text-xs font-medium truncate" title={frame.name}>{frame.name}</span>
                              </div>
                              <div 
                                  className="h-40 flex items-center justify-center p-2 bg-gray-100"
                                  style={{ backgroundColor: bgColor === 'transparent' ? undefined : bgColor }}
                              >
                              </div>
                          </div>
                      );
                  })}
                  {frames.length === 0 && (
                      <p className="text-gray-500 col-span-full text-center mt-10">No frames found on the first page of the Figma file.</p>
                  )}
              </div>
          </div>
      </main>
    </div>
  );
}
