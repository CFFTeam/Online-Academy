import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import courseModel from '../models/courseModel.js';
import courseDetailsModel from '../models/courseDetailsModel.js';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: 'config.env' });

mongoose.connect(process.env.DATABASE)
.then(() => console.log('connect to database successfully'))
.catch(err => console.log(err));

const scripts = {
    'courses': {
        '--import': () => {
        },
        '--eject': () => {

            courseModel.deleteMany()
            .then(() => console.log('courses: eject successfully'))
            .catch(err => console.log(err))
            .finally(() => mongoose.connection.close());

        }
    },
    'courses-details': {
        '--import': () => {
        },
        '--eject': () => {

            courseDetailsModel.deleteMany()
            .then(() => console.log('courses details: eject successfully'))
            .catch(err => console.log(err))
            .finally(() => mongoose.connection.close());
        }
    }
};

const type = process.argv[2];
const action = process.argv[3];

if (type && action)
    scripts[type][action]();
