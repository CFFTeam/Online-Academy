import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { load } from 'cheerio';
import request from 'request-promise';
import fs from 'fs';
import slugify from 'slugify';

import courseModel from '../models/courseModel.js';

import path, { dirname } from "path";
import { fileURLToPath } from "url";
import courseDetails from '../models/courseDetailsModel.js';
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: 'config.env' });

mongoose.connect(process.env.DATABASE)
.then(() => console.log('connect to database successfully'))
.catch(err => console.log(err));

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
    
                request(options, async (error, response, data) => {
                    const course = data.replaceAll(',"', ',\n"');
                    const courseObj = JSON.parse(course);
    
                    const newCourse ={};

                    const course_name = courseObj.published_title;
    
                    newCourse.name = courseObj.title;
                    newCourse.img = courseObj.image_480x270.replaceAll('480x270', '750x422');
                    newCourse.details = courseObj.description;
                    newCourse.slug = courseObj.url;
                    newCourse.author = courseObj.visible_instructors[0].display_name;
                    newCourse.price = courseObj.price;
                    newCourse.description = courseObj.headline;
                    newCourse.currency = 'USD';
                    newCourse.sale = 0;
                    newCourse.finish = 1;
                    newCourse.category = courseObj.primary_category.title;
                    newCourse.subcategory = courseObj.primary_subcategory.title;
                    newCourse.date = courseObj.created;

                    const folder_path = `public/courses/${courseObj.url.replace('/course/', '')}`;

                    fs.mkdirSync(folder_path);

                    const options2 = {
                        uri: `https://www.udemy.com/api-2.0/course-landing-components/${course_id.trim()}/me/?components=curriculum_context`,
                        headers: {
                            'Authorization': `Basic UlBvV01wa2NMMElIekdCQk5ZaFp2SW9pdktNRDluQVhPZ1oyajF6bjpld0JMU0cwTXBuaVdLTW1QN2xteUNoWjd6bWN2d05SenlJTnlvZ2NuOEx0NnZzaURZcTNudkM0UjZ5TXp6Y2ljQXZsSVJYdVRzR3ZtOG01eUxKQkc1OWJES0hiQVNqRUFEeUsybVlxTExoczRGQnNJTTlGNEZnMDNJdEc4eExwVQ==`,
                            "Accept": "application/json, text/plain, */*",
                            "Content-Type": "application/json;charset=utf-8"
                        }
                    }
        
                    request(options2, async (error, response, data) => {
                        const course = data.replaceAll(',"', ',\n"');
                        const courseObj = JSON.parse(course);
    
                        const lectures = {};
    
                        const sections = courseObj.curriculum_context.data.sections;
    
                        const hours = courseObj.curriculum_context.data.estimated_content_length_text.split(':')[0];
                        const minutes = courseObj.curriculum_context.data.estimated_content_length_text.split(':')[1];
    
                        const lectures_duration = `${(hours > 0) ? `${hours}h ` : ''}${minutes}m duration`;
                        const lectures_total = courseObj.curriculum_context.data.num_of_published_lectures;
    
                        lectures.duration = lectures_duration;
                        lectures.total = lectures_total;
                        lectures.sections = [];
    
                        sections.forEach(section => {
                            let sduration = '';
    
                            if (section.content_length_text.split(':').length === 3) {
                                const shours = section.content_length_text.split(':')[0];
                                const sminutes = section.content_length_text.split(':')[1];
                                sduration = `${(shours > 0) ? `${shours}h ` : ''}${sminutes}m`;
                            }
                            else {
                                const sminutes = section.content_length_text.split(':')[0];
                                const sseconds = section.content_length_text.split(':')[1];
                                sduration = `${(sminutes > 0) ? `${sminutes}m ` : ''}${sseconds}sec`;
                            }
                            
                            const newsection = {
                                title: section.title,
                                total: section.lecture_count,
                                duration: sduration,
                                lessons: []
                            };

                            const section_name = slugify(section.title, {
                                lower: true,
                                locale: 'vi',
                                strict: true
                            });

                            const section_path = path.join(folder_path, section_name);
    
                            fs.mkdirSync(section_path);

                            section.items.forEach(lession => { 
                                let lduration = "";
                                if (lession.content_summary.split(':').length === 3) {
                                    const lhours = lession.content_summary.split(':')[0];
                                    const lminutes = lession.content_summary.split(':')[1];
                                    lduration = `${(lhours > 0) ? `${lhours}h ` : ''}${lminutes}m`;
                                }
                                else {
                                    const lminutes = lession.content_summary.split(':')[0];
                                    const lseconds = lession.content_summary.split(':')[1];
                                    lduration = `${(lminutes > 0) ? `${lminutes}m ` : ''}${lseconds}sec`;
                                }
    
                                const slug = slugify(lession.title, {
                                    lower: true,    
                                    locale: 'vi',
                                    strict: true
                                });

                                const lesson_path = path.join(section_path, `.gitkeep`);
                                
                                fs.copyFileSync('public/courses/.gitkeep', lesson_path);
                                
                                const newlession = {
                                    title: lession.title,
                                    duration: lduration,
                                    resourses: [],
                                    preview: `${lession.learn_url.replaceAll('learn', 'preview').substring(0, lession.learn_url.replaceAll('learn', 'preview').lastIndexOf('/'))}/${slug}`,
                                    url: `${lession.learn_url.substring(0, lession.learn_url.lastIndexOf('/'))}/${slug}`,
                                    video: "http://videostreamsv.000webhostapp.com/test.mp4"
                                };
    
                                newsection.lessons.push(newlession);
                            });
    
                            lectures.sections.push(newsection);
                        });

                        newCourse.lectures = lectures;

                        const ncourse = new courseModel(newCourse);
                        await ncourse.save();

                        fs.writeFileSync(`${__dirname}/courses/${course_name}.json`, JSON.stringify(newCourse), err => {
                            if (err)
                                console.error(err);
                        });
    
                        console.log('File saved successfully');
                    });
    
                });
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
                    const course_title = courseObj.title;

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
                    
                    request(options, async (error, response, data) => {
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

                        const myCourse = await courseModel.findOne({name: course_title}).select('+_id');

                        newCourseReview.course_id = myCourse._id;
                        newCourseReview.reviews = newReviews;

                        const details = new courseDetails(newCourseReview);
                        await details.save();
                        
                        fs.writeFileSync(`${__dirname}/reviews/${course_name}.json`, JSON.stringify(newCourseReview), err => {
                            if (err)
                                console.error(err);
                        });
                    });

                    console.log('File saved successfully');
                });
            }
            else 
                console.log('No course id found');
        }
    });
}
else if (mode === "--course-lectures") { 
    // request(url, (error, response, html) => {
    //     const newLocal2 = !error && response.statusCode === 200;
    //     if (newLocal2) {
    //         const $ = load(html);
            
    //         const course_id = $('body#udemy').attr('data-clp-course-id');
    //         if (course_id) {
                
    //         }
    //         else 
    //             console.log('No course id found');
    //     }
    // });
}