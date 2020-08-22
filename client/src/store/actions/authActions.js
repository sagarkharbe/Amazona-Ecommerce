import axios from 'axios';

import { getMessages } from './messageActions';
import {
  LOGIN_WITH_OAUTH_LOADING,
  LOGIN_WITH_OAUTH_SUCCESS,
  LOGIN_WITH_OAUTH_FAIL,
  LOGOUT_SUCCESS,
  LOGIN_WITH_USERNAME_LOADING,
  LOGIN_WITH_USERNAME_SUCCESS,
  LOGIN_WITH_USERNAME_FAIL,
  ME_LOADING,
  ME_SUCCESS,
  ME_FAIL,
  RESEED_DATABASE_LOADING,
  RESEED_DATABASE_SUCCESS,
  RESEED_DATABASE_FAIL,
} from '../types';

export const loadMe = () => async (dispatch, getState) => {
  dispatch({ type: ME_LOADING });

  try {
    const options = attachTokenToHeaders(getState);
    const response = await axios.get('/api/users/me', options);

    dispatch({
      type: ME_SUCCESS,
      payload: { me: response.data.me },
    });
  } catch (err) {
    dispatch({
      type: ME_FAIL,
      payload: { error: err.response.data.message },
    });
  }
};

export const loginUserWithUsername = (formData, history) => async (dispatch, getState) => {
  dispatch({ type: LOGIN_WITH_USERNAME_LOADING });
  console.log(formData)
  try {
    const response = await axios.post('/auth/login', formData);

    dispatch({
      type: LOGIN_WITH_USERNAME_SUCCESS,
      payload: { token: response.data.token, me: response.data.me },
    });

    dispatch(loadMe());
    history.push('/');
  } catch (err) {
    console.log(err.response.data)
    dispatch({
      type: LOGIN_WITH_USERNAME_FAIL,
      payload: { error: err.response.data.message },
    });
  }
};

export const logInUserWithOauth = (token) => async (dispatch, getState) => {
  dispatch({ type: LOGIN_WITH_OAUTH_LOADING });

  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    };

    const response = await axios.get('/api/users/me', { headers });

    dispatch({
      type: LOGIN_WITH_OAUTH_SUCCESS,
      payload: { me: response.data.me, token },
    });
  } catch (err) {
    dispatch({
      type: LOGIN_WITH_OAUTH_FAIL,
      payload: { error: err.response.data.message },
    });
  }
};

// Log user out
export const logOutUser = (history) => async (dispatch) => {
  try {
    deleteAllCookies();
    //just to log user logut on the server
    await axios.get('/auth/logout');

    dispatch({
      type: LOGOUT_SUCCESS,
    });
    if (history) history.push('/');
  } catch (err) { }
};

function deleteAllCookies() {
  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf('=');
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export const attachTokenToHeaders = (getState) => {
  const token = getState().auth.token;

  const config = {
    headers: {
      'Content-type': 'application/json',
    },
  };

  if (token) {
    config.headers['x-auth-token'] = token;
  }

  return config;
};
