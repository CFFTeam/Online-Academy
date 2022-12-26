import mongoose from "mongoose";

const courseDetailsSchema = new mongoose.Schema({
  course_id: { type: String },
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

const courseDetails = mongoose.model("courses_details", courseDetailsSchema);

export default courseDetails;
