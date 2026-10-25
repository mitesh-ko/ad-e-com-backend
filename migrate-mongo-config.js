import 'dotenv/config';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ad_e_com';

// Extract database name from connection string (e.g. mongodb://localhost:27017/ad_e_com -> ad_e_com)
let databaseName = 'ad_e_com';
try {
    // Support standard mongodb:// and mongodb+srv:// URIs
    const normalized = mongoUri.replace(/^mongodb(\+srv)?:\/\//, 'http://');
    const url = new URL(normalized);
    const pathDb = url.pathname.replace(/^\//, '');
    if (pathDb) {
        databaseName = pathDb.split('?')[0];
    }
} catch {
    databaseName = 'ad_e_com';
}

const config = {
    mongodb: {
        url: mongoUri,
        databaseName,
        options: {
            connectTimeoutMS: 10000,
        },
    },
    migrationsDir: './src/database/migrations',
    changelogCollectionName: 'changelog',
    lockCollectionName: 'changelog_lock',
    lockTtl: 0,
    migrationFileExtension: '.js',
    useFileHash: false,
    moduleSystem: 'esm',
};

export default config;
