import mongo from "mongodb";
// zamijeni sa svojim connection stringom
let connection_string = "mongodb+srv://dilevak:Jup1ter1@cluster-fipuzor.11alf6u.mongodb.net/?retryWrites=true&w=majority";

let client = new mongo.MongoClient(connection_string, { 
useNewUrlParser: true,
useUnifiedTopology: true
});
client.connect(err => { if (err) {
console.error(err);
return; }
console.log("Database connected successfully!");
// za sada ništa nećemo raditi, samo zatvaramo pristup sljedećom naredbom
client.close(); });

let db = null
// eksportamo Promise koji resolva na konekciju
export default () => {
return new Promise((resolve, reject) => {
    // ako smo inicijalizirali bazu i klijent je još uvijek spojen
if (db && client.isConnected()) { resolve(db)
}
else {
client.connect(err => { if (err) {
reject("Spajanje na bazu nije uspjelo:" + err); }
else {
console.log("Database connected successfully!");
db = client.db("fipugram");
          resolve(db);
        }
}); }
}); }