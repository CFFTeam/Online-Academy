import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import url from "url";

export const renderCourseDetail = catchAsync(async (req, res) => {
    res.locals.handlebars = "courseDetail/courseDetail";

    const getCourse = await Course.findOne({
        slug: `/course${url.parse(req.url, true).pathname}/`
    }).lean();
    console.log("-----------------");
    console.log(getCourse);
    res.render(res.locals.handlebars, {
        courseDetail: getCourse,
        isBestSeller: getCourse.sale > 100
    });

  });