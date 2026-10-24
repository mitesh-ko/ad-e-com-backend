import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserProfile {
  type?: string;
  url?: string;
}

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  profile?: IUserProfile[];
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): Omit<IUserDocument, 'password'>;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    type: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    profile: [userProfileSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
