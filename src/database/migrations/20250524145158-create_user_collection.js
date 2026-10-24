export default {
    /**
     * @param db {import('mongodb').Db}
     * @param client {import('mongodb').MongoClient}
     * @returns {Promise<void>}
     */
    async up(db, client) {
        const collections = await db.listCollections({ name: 'users' }).toArray();
        const validator = {
            $jsonSchema: {
                bsonType: 'object',
                title: 'UserObject',
                description: 'Schema for user registration and authentication',
                required: ['email', 'password'],
                properties: {
                    name: {
                        bsonType: 'string',
                        description: 'User name must be a string'
                    },
                    email: {
                        bsonType: 'string',
                        description: 'User email must be a valid email string and is required'
                    },
                    password: {
                        bsonType: 'string',
                        description: 'Password must be a string and is required'
                    },
                    role: {
                        bsonType: 'string',
                        enum: ['admin', 'user'],
                        description: 'Role must be admin or user'
                    },
                    status: {
                        bsonType: 'string',
                        enum: ['active', 'inactive'],
                        description: 'Status must be either active or inactive'
                    }
                }
            }
        };

        if (collections.length === 0) {
            await db.createCollection('users', { validator });
        } else {
            await db.command({ collMod: 'users', validator });
        }

        // Ensure critical indexes are created
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ role: 1 });
        await db.collection('users').createIndex({ status: 1 });
    },

    /**
     * @param db {import('mongodb').Db}
     * @param client {import('mongodb').MongoClient}
     * @returns {Promise<void>}
     */
    async down(db, client) {
        await db.command({ collMod: 'users', validator: {} });
    }
};
