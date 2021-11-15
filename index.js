const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const app = express();
const cors = require('cors');


const port = process.env.PORT || 4000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.anpif.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {
        await client.connect();
        const database = client.db("ramotoDB");
        const orderCollection = database.collection("orders");
        const bikeCollection = database.collection("bikes");
        const reviewCollection = database.collection("User_Review");
        const usersCollection = database.collection("Users");

        // GET ADDED NEW PRODUCTS ,5
        app.get('/bikes', async (req, res) => {
            const cursor = bikeCollection.find({});
            const getNewProduct = await cursor.toArray();
            res.send(getNewProduct);
        })
        // POST ADD NEW PRODUCT API, 4 
        app.post('/newBikes', async (req, res) => {
            const newProduct = req.body;
            const result = await bikeCollection.insertOne(newProduct);

            res.json(result);
        })

        // POST ALL BOOKED PRODUCT API, 1
        app.post('/allOrders', async (req, res) => {
            const bookedProduct = req.body;
            const result = await orderCollection.insertOne(bookedProduct);
            // console.log('Booked Product', req.body)
            // console.log('Booked  new Product', result)
            res.json(result);
        })

        // GET ALL BOOKED PRODUCTS, 2
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const getProduct = await cursor.toArray();
            res.send(getProduct);
        })

        // GET MY BOOKED PRODUCTS, 3 
        app.get('/orders/:email', async (req, res) => {
            console.log(req.params.email)
            const result = await orderCollection.find({
                email: req.params.email
            }).toArray();

            res.send(result);
        })
        // POST USER REVIEW ,6
        app.post('/postReview', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);

            res.json(result)
        })
        // GET USERS REVIEW,7 
        app.get('/getReviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        // ADD  NEW REGISTRATION USER,8
        app.post('/addUsers', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.json(result);
        })
        // ADD GOOGLE SIGN IN USERS TO DB,9 
        app.put('/addUsers', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.json(result);
        })
        //   MAKE AN ADMIN,10
        app.put('/addUsers/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'Admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // ADMIN SET UP,11 
        app.get('/addUsers/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            res.json({ Admin: isAdmin })
        })
        // DELETE ALL BOOKED PRODUCTS,12 
        app.delete('/orders:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log('Deleting with id', id)
            res.send(result);
        })

        // DELETE PRODUCTS BY ID,13
        app.delete('/bikes:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikeCollection.deleteOne(query);
            console.log('Deleting with id', id)
            res.send(result);
        })
        // ORDER STATUS UPDATE 



    }

    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello RA-MOTO!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})