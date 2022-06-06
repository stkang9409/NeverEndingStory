import axios from 'axios';
import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER,
    LOGOUT_USER,
} from './types';

const config = require('../config/key');
import { USER_SERVER } from '../components/Config.js';

axios.defaults.baseURL = config.SERVER;
export function registerUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/register`,dataToSubmit)
        .then(response => response.data);
    
    return {
        type: REGISTER_USER,
        payload: request
    }
}

export function loginUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/login`,dataToSubmit)
                .then(response => response.data);
    console.log(request)
    return {
        type: LOGIN_USER,
        payload: request
    }
}

export function auth(){
    const request = axios.get(`${USER_SERVER}/auth`)
    .then(response => response.data);
    console.log(request);
    return {
        type: AUTH_USER,
        payload: request
    }
}

export function logoutUser(){
    return {
        type: LOGOUT_USER,
        payload: null
    }
}

