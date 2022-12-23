import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String },
  img: { type: String },
  author: { type: String },
  description: { type: String },
  currency: { type: String },
  price: { type: Number },
  sale: { type: Number },
  category: { type: String },
  subcategory: { type: String },
  details: { type: Number },
  date: { type: String },
  lectures: {
    total: { type: Number },
    duration: { type: String, },
    sections: [
      {
        title: { type: String },
        total: { type: Number },
        duration: { type: String },
        lessons: [
          {
            title: { type: String },
            resources: { type: String },
            video: { type: String },
          },
        ],
      },
    ],
  },
});

const Course = mongoose.model("course", courseSchema);

export default Course;
