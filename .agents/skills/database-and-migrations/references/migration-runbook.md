# Database Migration Runbook (`migrate-mongo`)

## 1. Creating a New Migration

From `backend/`:
```bash
npm run migrate:create add_inventory_tracking_to_products
```
This generates a file in `src/database/migrations/<timestamp>-add_inventory_tracking_to_products.js`.

---

## 2. Migration Template Anatomy

```javascript
module.exports = {
  async up(db, client) {
    // 1. Create collection if not exists
    const collections = await db.listCollections({ name: 'products' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('products');
    }

    // 2. Add indexes with explicit options
    await db.collection('products').createIndex(
      { sku: 1 },
      { unique: true, background: true, name: 'idx_products_sku' }
    );

    // 3. Optional: Schema transformation or default backfills
    await db.collection('products').updateMany(
      { isPublished: { $exists: false } },
      { $set: { isPublished: false } }
    );
  },

  async down(db, client) {
    // Revert index
    await db.collection('products').dropIndex('idx_products_sku');
  }
};
```

---

## 3. Execution Commands

```bash
# Check status
npm run migrate:status

# Apply pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down
```

---

## 4. Migration Rules of Thumb
- **Zero Downtime**: Adding a field with a default value in the Mongoose schema is safer than running a blocking table-wide rewrite in MongoDB unless an index is strictly required.
- **Background Indexes**: Always use `{ background: true }` when creating indexes on existing production collections.
- **Rollback Safety**: Always write the symmetric `down()` method so rollbacks in staging/production don't fail midway.
