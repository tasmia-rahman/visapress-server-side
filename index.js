const express = require('express');
var cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aw5zzia.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        const serviceCollection = client.db('visapressDB').collection('services');
        const reviewCollection = client.db('visapressDB').collection('reviews');

        //Services
        app.get('/home_services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        //Reviews
        app.get('/reviews', async (req, res) => {

            if (req.query.serviceName) {
                query = {
                    serviceName: req.query.serviceName
                }
            }
            const cursor = reviewCollection.find(query).sort({ date: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            review.date = Date();
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        //My Reviews
        app.get('/my_reviews', async (req, res) => {

            // if (req.query.email) {
            query = {
                email: req.query.email
            }
            // }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/my_reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        app.patch('/my_reviews/:id', async (req, res) => {
            const id = req.params.id;
            const reviewText = req.body.reviewText;
            console.log(reviewText);
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    reviewText: reviewText
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/my_reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('API running');
})

app.listen(port, () => {
    console.log('Server is running on port', port);
})