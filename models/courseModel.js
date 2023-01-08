import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String },
  active: { type: Boolean, default: true},
  img: { type: String },
  author: { type: String },
  description: { type: String },
  slug: { type: String },
  currency: { type: String },
  price: { type: String },
  sale: { type: Number },
  finish: { type: Number },
  category: { type: String },
  subcategory: [String],
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

courseSchema.pre("save", function (next) { 
  this.date = new Date().toJSON();
  next();
});

courseSchema.pre("findOneAndUpdate", function (next) { 
  this.findOneAndUpdate({}, { $set: { date: new Date().toJSON() } });
  next();
});

courseSchema.index({ name: "text", description: "text", category: "text", subcategory: "text", author: "text" }, { default_language: "none" });

const Course = mongoose.model("course", courseSchema);

export default Course;
