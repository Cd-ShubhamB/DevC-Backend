const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a Post
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!req.body.content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = new Post({ user: req.userId, content: req.body.content });
    await post.save();
    await post.populate("user", "name");

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Lazy Load Posts with Pagination
router.get("/", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 5;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Like a Post
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.userId;
    if (post.likedBy.includes(userId)) {
      return res.status(400).json({ message: "You already liked this post." });
    }

    post.likes += 1;
    post.likedBy.push(userId);
    await post.save();

    res.json({ message: "Post liked", likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Unlike a Post
router.post("/:id/unlike", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.userId;
    const index = post.likedBy.indexOf(userId);

    if (index === -1) {
      return res.status(400).json({ message: "You haven't liked this post yet." });
    }

    post.likes -= 1;
    post.likedBy.splice(index, 1);
    await post.save();

    res.json({ message: "Post unliked", likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a Comment to a Post
router.post("/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;
    const userId = req.userId;

    if (!text?.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ user: userId, text });
    await post.save();

    res.status(201).json(post.comments);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch Comments for a Specific Post
router.get("/:postId/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("comments.user", "name");
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get Posts by a Specific User
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).populate("user", "name");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a Post (Only the Owner Can Delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;