
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gzkpw83.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
  try {

    await client.connect();
    const blogcategories = client.db("micca-blog").collection("blogcategories");
    const blogs = client.db("micca-blog").collection("blogs");
    const authors = client.db("micca-blog").collection("authors");



    app.get('/blogs-categories', async (req, res) => {
      try {
        const categories = await blogcategories.find({}).toArray();
        res.json(categories);

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/blogs', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const blogArray = await blogs.find().toArray(); // Convert MongoDB cursor to array
        const paginatedBlogs = blogArray.slice(startIndex, endIndex);
        res.send(paginatedBlogs);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    });

   
    app.get('/category/:id', async (req, res) => {
      const categoryId = req.params.id;
      try {
        const categoryBlogs = await blogs.find({ category: categoryId }).toArray();
        if (categoryBlogs.length > 0) {
          res.json(categoryBlogs);
        } else {
          res.status(404).json({ message: 'No blog posts found for the specified category ID' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    app.get('/blogs', async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const blogArray = await blogs.find().toArray();
        const paginatedBlogs = blogArray.slice(startIndex, endIndex);
        res.send(paginatedBlogs);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    });
    

    app.get('/blog/:id/related', async (req, res) => {
      const id = req.params.id;

      try {
        const blog = await blogs.findOne({ _id: new ObjectId(id) });

        if (!blog || !blog.related) {
          res.status(404).json({ message: 'Post not found or related missing' });
          return;
        }
        const relatedBlogIds = blog.related;
        const relatedBlogs = await blogs.find({ blog: { $in: relatedBlogIds } }).toArray();
        res.status(200).json(relatedBlogs);
      } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.get('/inspirational-blog', async (req, res) => {
      try {
        const inspirationalPosts = await blogs.find({ blog: "17" }).toArray();
        if (inspirationalPosts.length > 0) {
          res.json(inspirationalPosts);
        } else {
          res.status(404).json({ message: 'Inspirational blog posts not found' });
        }
      } catch (error) {
        console.error('Error fetching inspirational blog posts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });


    app.get('/lifelessons-blog', async (req, res) => {
      try {
        const lifelessonsPosts = await blogs.find({ blog: "14" }).toArray();
        if (lifelessonsPosts.length > 0) {
          res.json(lifelessonsPosts);
        } else {
          res.status(404).json({ message: 'Life lessons blog posts not found' });
        }
      } catch (error) {
        console.error('Error fetching life lessons blog posts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });


    app.get('/productivity-blog', async (req, res) => {
      try {
        const productivityPosts = await blogs.find({ blog: "11" }).toArray();
        if (productivityPosts.length > 0) {
          res.json(productivityPosts);
        } else {
          res.status(404).json({ message: 'Productivity blog posts not found' });
        }
      } catch (error) {
        console.error('Error fetching productivity blog posts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    app.get('/authors', async (req, res) => {
      try {
        const authorca = await authors.find({}).toArray();
        res.json(authorca);

      } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/author/:authId', async (req, res) => {
      const authId = req.params.authId;

      try {
        const author = await authors.findOne({ authId: authId });

        if (author) {
          res.json(author);
        } else {
          res.status(404).json({ message: 'Post not found' });
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    app.get('/author/:authId/blogs', async (req, res) => {
      try {
        const authId = req.params.authId;
        const author = await authors.findOne({ authId: authId });

        if (!author) {
          return res.status(404).json({ error: 'Author not found' });
        }
        const authorBlogs = await blogs.find({ "author.authId": author.authId }).toArray();
        res.json({ blogs: authorBlogs });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

run().catch(console.error);

app.get('/', async (req, res) => {
  res.send('blogs  server is running');
});

app.listen(port, () => console.log(`blogs server listening on port ${port}`));
