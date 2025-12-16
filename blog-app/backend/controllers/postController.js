const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id, // 👈 ownership attached here
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("author", "username email")
    .sort({ createdAt: -1 });

  res.json(posts);
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // ownership check
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    post.title = req.body.title;
    post.content = req.body.content;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // ownership check
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};
