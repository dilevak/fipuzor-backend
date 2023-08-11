import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://dilevak:Jup1ter1@cluster-fipuzor.11alf6u.mongodb.net/?retryWrites=true&w=majority";

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