import mongoose, { Schema, Document } from 'mongoose'

export type VideoStatus = 'uploading' | 'processing' | 'done' | 'failed'
export type CaptionStyle = 'classic' | 'modern' | 'karaoke' | 'animated'

export interface IVideo extends Document {
  userId: mongoose.Types.ObjectId
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  status: VideoStatus
  captionStyle: CaptionStyle
  error?: string
  transcript?: string
  clipStart?: number
  clipEnd?: number
}

const VideoSchema = new Schema<IVideo>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'done', 'failed'],
    default: 'uploading',
  },
  captionStyle: {
    type: String,
    enum: ['classic', 'modern', 'karaoke', 'animated'],
    default: 'modern',
  },
  error: { type: String },
  transcript: { type: String },
  clipStart: { type: Number },
  clipEnd: { type: Number },
}, { timestamps: true })

export default mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema)
