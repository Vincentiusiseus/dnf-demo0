import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://127.0.0.1:27017';
export const client = new MongoClient(url);

// Database Name
const dbName = 'dnf-data';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('documents');

  // the following code examples can be pasted here...

  return 'done.';
}