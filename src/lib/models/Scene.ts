import mongoose, { Schema, Document } from 'mongoose'

export interface IScene extends Document {
  videoId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  start: number
  end: number
  title: string
  clipFilePath: string
  thumbnailPath: string
  duration: number
  fileSize: number
  status: 'processing' | 'done' | 'failed'
  expiresAt: Date
  downloads: number
}

const SceneSchema = new Schema<IScene>({
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  title: { type: String, default: 'Clip' },
  clipFilePath: { type: String },
  thumbnailPath: { type: String },
  duration: { type: Number },
  fileSize: { type: Number },
  status: {
    type: String,
    enum: ['processing', 'done', 'failed'],
    default: 'processing',
  },
  expiresAt: { type: Date },
  downloads: { type: Number, default: 0 },
}, { timestamps: true })

const SceneModel = mongoose.models.Scene || mongoose.model<IScene>('Scene', SceneSchema)
export default SceneModel
