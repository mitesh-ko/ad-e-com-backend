# Mongoose Design Patterns and Best Practices

## 1. Schema Definition with TypeScript
Use `Schema<IDocument>` and export both the interface and the model:

```typescript
import { Schema, model, Document, Types } from 'mongoose';

export interface ICategoryDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const CategoryModel = model<ICategoryDocument>('Category', CategorySchema);
```

---

## 2. Multi-Document Transactions
When a business operation touches multiple documents (e.g. order placement + inventory deduction):

```typescript
import mongoose from 'mongoose';

export const executeInTransaction = async <T>(
  operation: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
```
Pass `{ session }` into all Mongoose queries inside the transaction block.
