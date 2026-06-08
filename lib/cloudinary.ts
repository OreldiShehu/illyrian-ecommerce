import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

type UploadResult = {
  public_id: string
  secure_url: string
  url: string
}

type ImageTransform = 'product' | 'logo' | 'banner' | 'avatar'

const TRANSFORMS: Record<ImageTransform, string> = {
  product: 'w_800,q_auto,f_auto',
  logo: 'w_200,h_200,c_fill,q_auto',
  banner: 'w_1200,h_400,c_fill,q_auto',
  avatar: 'w_100,h_100,c_fill,q_auto',
}

export async function uploadImage(
  file: File | string,
  folder: string,
  transform: ImageTransform = 'product'
): Promise<UploadResult> {
  let base64: string

  if (typeof file === 'string') {
    base64 = file
  } else {
    const buffer = await file.arrayBuffer()
    const bytes = Buffer.from(buffer)
    base64 = `data:${file.type};base64,${bytes.toString('base64')}`
  }

  const result = await cloudinary.uploader.upload(base64, {
    folder: `mio-ecommerce/${folder}`,
    resource_type: 'image',
  })

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
  }
}

export async function uploadMultipleImages(
  files: File[],
  folder: string,
  transform: ImageTransform = 'product'
): Promise<UploadResult[]> {
  return Promise.all(files.map((f) => uploadImage(f, folder, transform)))
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(url: string, transform: ImageTransform): string {
  if (!url.includes('cloudinary.com')) return url
  const parts = url.split('/upload/')
  if (parts.length !== 2) return url
  return `${parts[0]}/upload/${TRANSFORMS[transform]}/${parts[1]}`
}
