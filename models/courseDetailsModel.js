import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  course_id: { type: mongoose.Types.ObjectId },
  viewer: { type: Number },
  avg_rating: { type: Number },
  num_reviews: { type: Number },
  reviews: [
    {
        content: { type: String },
        rating: { type: Number },
        like: { type: Number },
        dislike: { type: Number },
        created: { type: String },
        user: {
            name: { type: String },
            avatar: { type: String }
        }
    }
  ]
});

const Category = mongoose.model("category", categorySchema);

export default Category;
