import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import url from "url";

export const renderCourseDetail = catchAsync(async (req, res) => {
    const getCourse = await Course.findOne({
        slug: `/course${url.parse(req.url, true).pathname}/`,
    }).lean();
    console.log("-----------------");
    console.log(getCourse);
    res.render("courseDetail/courseDetail.hbs", {
        courseDetail: getCourse,
        isBestSeller: getCourse.sale > 100
    });

  });