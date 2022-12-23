import mongoose from "mongoose";

const categoryDetailSchema = new mongoose.Schema({
  title: { type: String },
  reviews: { type: Number },
  votes: { type: Number },
  views: { type: Number },
  courses: { type: Number },
  students: { type: Number },
  isEmpty: {
    type: Boolean,
    default: false
  },
});

const CategoryDetail = mongoose.model("category-detail", categoryDetailSchema);

export default CategoryDetail;
