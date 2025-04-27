"use client"
import { scanRecipt } from '@/actions/transaction'
import { Button } from '@/components/ui/button'
import useFetch from '@/hooks/use-fetch'
import { Camera, Loader2 } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const ReciptScanner = ({ onScanComplete }) => {
    
    const fileInputRef = useRef()
    const {
        loading: scanReciptLoading,
        fn: scanReciptFn,
        data: scannedData,
    } = useFetch(scanRecipt)

    const handleReciptScan = async (file) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit")
            return 
        }

        await scanReciptFn(file)
    }

    useEffect(() => {
        if (scannedData && !scanReciptLoading) {
            onScanComplete(scannedData)
            toast.success("Recipt scanned successfully")
      }
    }, [scanReciptLoading, scannedData])
    


  return (
      <div>
          <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                  const file = e.target.files?.[0]
                  if(file) handleReciptScan(file)
              }}
          />
          <Button
              type='button'
              variant={"outline"}
              className='w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white'
              onClick={() => fileInputRef.current?.click()}
              disabled={scanReciptLoading}
          >
              {scanReciptLoading
                  ? <>
                     <Loader2 className='mr-2 animate-spin' />
                      <span>Scanning Recipt...</span>
                  </> : <>
                       <Camera className='mr-2' />
                      <span>Scan Recipt with AI</span>
                  </>
            }
          </Button>
    </div>
  )
}

export default ReciptScanner