import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String },
  img: { type: String },
  author: { type: String },
  description: { type: String },
  slug: { type: String },
  currency: { type: String },
  price: { type: String },
  sale: { type: String },
  finish: { type: Number },
  category: { type: String },
  subcategory: [{ type: String }],
  details: { type: String },
  date: { type: String },
  lectures: {
    total: { type: Number },
    duration: { type: String },
    sections: [
      {
        title: { type: String },
        total: { type: Number },
        duration: { type: String },
        lessons: [
          {
            title: { type: String },
            resources: [{ type: String }],
            url: { type: String },
            preview: { type: String },
            video: { type: String }
          }
        ]
      }
    ]
  }
});

courseSchema.index({ name: "text", description: "text", category: "text", subcategory: "text", author: "text" }, { default_language: "none" });
const Course = mongoose.model("course", courseSchema);

export default Course;
