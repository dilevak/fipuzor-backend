import { MongoClient, ServerApiVersion } from 'mongodb';

//dodaj user i pass za konekciju na prije pokretanja
const uri = "mongodb+srv://user:password@cluster-fipuzor.11alf6u.mongodb.net/?retryWrites=true&w=majority";

export async function connect() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}


export default connect;