import { load } from 'cheerio';
import request from 'request-promise';
import fs from 'fs';

import Course from '../models/courseModel.js';

import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.argv[2];
const mode = process.argv[3];

if (mode === "--courses") {
    request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = load(html);
            
            const course_id = $('body#udemy').attr('data-clp-course-id');
            if (course_id) {
                const options = {
                    uri: `https://www.udemy.com/api-2.0/courses/${course_id.trim()}?fields[course]=@default,headline,avg_rating,created,primary_category,primary_subcategory,description,owner,num_subscribers,-price_detail,-price_serve_tracking_id,-tracking_id,-is_practice_test_course,-is_paid&fields[course_category]=title,-id&fields[course_subcategory]=title,-created,-id&fields[user]=display_name,-title,-name,-initials`,
                    headers: {
                        'Authorization': `Basic UlBvV01wa2NMMElIekdCQk5ZaFp2SW9pdktNRDluQVhPZ1oyajF6bjpld0JMU0cwTXBuaVdLTW1QN2xteUNoWjd6bWN2d05SenlJTnlvZ2NuOEx0NnZzaURZcTNudkM0UjZ5TXp6Y2ljQXZsSVJYdVRzR3ZtOG01eUxKQkc1OWJES0hiQVNqRUFEeUsybVlxTExoczRGQnNJTTlGNEZnMDNJdEc4eExwVQ==`,
                        "Accept": "application/json, text/plain, */*",
                        "Content-Type": "application/json;charset=utf-8"
                    }
                }
    
                request(options, (error, response, data) => {
                    const course = data.replaceAll(',"', ',\n"');
                    const courseObj = JSON.parse(course);
    
                    const newCourse ={};
    
                    newCourse.name = courseObj.title;
                    newCourse.img = courseObj.image_480x270;
                    newCourse.details = courseObj.description;
                    newCourse.slug = courseObj.url;
                    newCourse.author = courseObj.visible_instructors[0].display_name;
                    newCourse.price = courseObj.price;
                    newCourse.description = courseObj.headline;
                    newCourse.currency = 'USD';
                    newCourse.sale = 0;
                    newCourse.category = courseObj.primary_category.title;
                    newCourse.subcategory = courseObj.primary_subcategory.title;
                    newCourse.date = courseObj.created;
                    newCourse.lectures = {
                        total: 0,
                        duration: "",
                        sections: [{
                            title: "",
                            total: 0,
                            duration: "",
                            lessons: [{ 
                                title: "",
                                resourses: "",
                                video: ""
                            }]
                        }]
                    }
    
                    fs.writeFileSync(`${__dirname}/courses/${courseObj.published_title}.json`, JSON.stringify(newCourse), err => {
                        if (err)
                            console.error(err);
                    });
                });
                console.log('File saved successfully');
            }
            else 
                console.log('No course id found');
        }
    });
}
else if (mode === "--course-details") {
    request(url, (error, response, html) => {
        const newLocal = !error && response.statusCode === 200;
        if (newLocal) {
            const $ = load(html);
            
            const course_id = $('body#udemy').attr('data-clp-course-id');
            if (course_id) {
                const options = {
                    uri: `https://www.udemy.com/api-2.0/courses/${course_id.trim()}?fields[course]=@min,num_lectures,num_subscribers,title,num_reviews,published_title,avg_rating,-url,-images,-visible_instructors,-headline,-created,-primary_category,-primary_subcategory,-description,-owner,-price_detail,-price_serve_tracking_id,-tracking_id,-is_practice_test_course,-is_paid`,
                    headers: {
                        'Authorization': `Basic UlBvV01wa2NMMElIekdCQk5ZaFp2SW9pdktNRDluQVhPZ1oyajF6bjpld0JMU0cwTXBuaVdLTW1QN2xteUNoWjd6bWN2d05SenlJTnlvZ2NuOEx0NnZzaURZcTNudkM0UjZ5TXp6Y2ljQXZsSVJYdVRzR3ZtOG01eUxKQkc1OWJES0hiQVNqRUFEeUsybVlxTExoczRGQnNJTTlGNEZnMDNJdEc4eExwVQ==`,
                        "Accept": "application/json, text/plain, */*",
                        "Content-Type": "application/json;charset=utf-8"
                    }
                }
    
                request(options, async (error, response, data) => {
                    const course = data.replaceAll(',"', ',\n"');
                    const courseObj = JSON.parse(course);

                    const course_name = courseObj.published_title;

                    const newCourseReview = {};

                    newCourseReview.viewer = courseObj.num_subscribers;
                    newCourseReview.avg_rating = Math.round(courseObj.avg_rating * 10) / 10;
                    newCourseReview.num_reviews = courseObj.num_reviews;

                    const options = {
                        uri: `https://www.udemy.com/api-2.0/courses/${course_id.trim()}/reviews/?is_text_review=1&ordering=course_review_score__rank,-created&fields[course_review]=@default,response,content_html,created_formatted_with_time_since&fields[user]=@min,image_50x50,initials,public_display_name,tracking_id&fields[course_review_response]=@min,user,content_html,created_formatted_with_time_since&page=1&page_size=20`,
                        headers: {
                            'Authorization': `Basic UlBvV01wa2NMMElIekdCQk5ZaFp2SW9pdktNRDluQVhPZ1oyajF6bjpld0JMU0cwTXBuaVdLTW1QN2xteUNoWjd6bWN2d05SenlJTnlvZ2NuOEx0NnZzaURZcTNudkM0UjZ5TXp6Y2ljQXZsSVJYdVRzR3ZtOG01eUxKQkc1OWJES0hiQVNqRUFEeUsybVlxTExoczRGQnNJTTlGNEZnMDNJdEc4eExwVQ==`,
                            "Accept": "application/json, text/plain, */*",
                            "Content-Type": "application/json;charset=utf-8"
                        }
                    }
                    
                    request(options, (error, response, data) => {
                        const reviews = data.replaceAll(',"', ',\n"');
                        const reviewList = JSON.parse(reviews);

                        const newReviews = [];

                        reviewList.results.forEach(review => { 
                            const newReview = {
                                content: review.content_html,
                                rating: review.rating,
                                created: review.created,
                                like: Math.round(Math.random() * 100),
                                dislike: Math.round(Math.random() * 10),
                                user: {
                                    name: review.user.display_name,
                                    avatar: review.user.image_50x50
                                }
                            }
                            newReviews.push(newReview);
                        });

                        newCourseReview.reviews = newReviews;
                        
                        fs.writeFileSync(`${__dirname}/reviews/${course_name}.json`, JSON.stringify(newCourseReview), err => {
                            if (err)
                                console.error(err);
                        });
                        // console.log(newCourseReview);
                    });

                    // fs.writeFileSync(`${__dirname}/courses/${courseObj.published_title}.json`, JSON.stringify(newCourse), err => {
                    //     if (err)
                    //         console.error(err);
                    // });
                    console.log('File saved successfully');
                });
            }
            else 
                console.log('No course id found');
        }
    });
}