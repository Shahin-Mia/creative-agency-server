const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const ObjectId = require('mongodb').ObjectID;
const port = 5000;
const app = express();
require('dotenv').config()

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('services'))
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nt3jq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db(process.env.DB_NAME).collection("services");
    const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
    const adminCollection = client.db(process.env.DB_NAME).collection("admin");
    const orderCollection = client.db(process.env.DB_NAME).collection("orders");
    console.log("Database connected successfully");

    app.post('/addServices', (req, res) => {
        const file = req.files.icon;
        const title = req.body.title;
        const desc = req.body.desc;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        let image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, desc, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addReviews', (req, res) => {
        const img = req.body.img;
        const name = req.body.name;
        const desc = req.body.desc;
        const designation = req.body.designation;
        console.log(img, name, desc, designation)
        reviewCollection.insertOne({ name, designation, desc, img })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/admin', (req, res) => {
        adminCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    app.get('/serviceItem/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, document) => {
                res.send(document[0])
            })
    })

    app.post('/addOrders', (req, res) => {
        const name = req.body.name;
        const desc = req.body.desc;
        const status = req.body.status;
        const title = req.body.title;
        const email = req.body.email;
        const price = req.body.price;
        const image = req.body.img;
        const details = req.body.details;
        orderCollection.insertOne({ name, status, title, email, price, desc, image, details })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/serviceId', (req, res) => {
        console.log(req.body)
        serviceCollection.find({ _id: ({ $in: req.body }) })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.patch('/update/:id', (req, res) => {
        console.log(req.body.status, req.params)
        orderCollection.updateOne({ _id: ObjectId(req.params.id) }, {
            $set: { status: req.body.status }
        })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

});

app.get('/', (req, res) => {
    res.send(`<h1 style="text-align:center">Welcome to creative agency database center</h1>`)
})





app.listen(process.env.PORT || port)