import { Button } from "@/components/ui/button"
import { ImagePlus, Trash } from "lucide-react"

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string[]) => void
  onRemove: (value: string) => void
  value: string[]
}

export function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value
}: ImageUploadProps) {
  
  const onUpload = () => {
    // In a real app, this would trigger a file picker and upload to S3/Cloudinary
    const mockUrl = `https://picsum.photos/seed/${Math.random()}/400/400`
    onChange([...value, mockUrl])
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                disabled={disabled}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <img
              className="object-cover w-full h-full"
              alt="Product Image"
              src={url}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        disabled={disabled}
        variant="secondary"
        onClick={onUpload}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Upload an Image
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Images are simulated for demonstration.
      </p>
    </div>
  )
}
