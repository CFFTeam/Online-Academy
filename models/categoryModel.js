import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  slug: { type: String },
  title: { type: String },
  subcategories:  [
    {
    slug: { type: String },
    content: { type: String },
  },
]
});

const Category = mongoose.model("category", categorySchema);

export default Category;
