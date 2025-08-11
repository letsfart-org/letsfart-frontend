import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils'
import SOLIcon from '../icons/sol'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const ChainInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, placeholder, children, ...props }, ref) => {
    //console.log("props: ", props);
  
    return (
      <Label className={cn("block relative")}>
        <div className='absolute flex items-center gap-2 top-[10px] right-3'>
          {children ?? <>
            <div className='text-base'>SOL</div>
            <SOLIcon />
          </>}
        </div>
        <Input type='string' placeholder={placeholder ?? '0.0'} className={(cn("[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-20 py-5 text-lg", className))} {...props} ref={ref} />
      </Label>
    )
  }
)

ChainInput.displayName = 'chain-input'

export default ChainInput