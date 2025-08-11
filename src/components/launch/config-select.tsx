import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"

export default function TokenConfigSelect ({
  options,
  onValueChange,
  defaultValue
}: {
  options: string[],
  onValueChange?: (arg0: string) => void,
  defaultValue?: string
}) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </FormControl>
      <SelectContent className="text-white bg-black" >
        <MemeSelectItem key={options[0]} value={options[0]} />
        <TechSelectItem key={options[1]} value={options[1]} />
      </SelectContent>
    </Select>
  )
}

function MemeSelectItem ({value}: {value: string, children?:React.ReactNode}) {
  return (
    <SelectItem value={value}>
        <div className="text-muted-foreground flex items-center gap-1">
          Meme(0.25% trading fees)
        </div> 
    </SelectItem>
  )
}

function TechSelectItem ({value}: {value: string, children?:React.ReactNode}) {
  return (
    <SelectItem value={value}>
        <div className="text-muted-foreground flex items-center gap-1">
          Tech(1.0% trading fees)
        </div> 
    </SelectItem>
  )
}
