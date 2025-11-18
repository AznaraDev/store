import axios from 'axios';
import {
  FETCH_DASHBOARD_REQUEST,
  FETCH_DASHBOARD_SUCCESS,
  FETCH_DASHBOARD_FAILURE,
  ADD_STOCK_REQUEST,
  ADD_STOCK_SUCCESS,
  ADD_STOCK_FAILURE,
  REMOVE_STOCK_REQUEST,
  REMOVE_STOCK_SUCCESS,
  REMOVE_STOCK_FAILURE,
  ADJUST_STOCK_REQUEST,
  ADJUST_STOCK_SUCCESS,
  ADJUST_STOCK_FAILURE,
  FETCH_STOCK_HISTORY_REQUEST,
  FETCH_STOCK_HISTORY_SUCCESS,
  FETCH_STOCK_HISTORY_FAILURE,
  FETCH_LOW_STOCK_REQUEST,
  FETCH_LOW_STOCK_SUCCESS,
  FETCH_LOW_STOCK_FAILURE,
  FETCH_OUT_OF_STOCK_REQUEST,
  FETCH_OUT_OF_STOCK_SUCCESS,
  FETCH_OUT_OF_STOCK_FAILURE,
  SET_STOCK_SECTION_FILTER,
  SET_STOCK_STATUS_FILTER,
  CLEAR_STOCK_FILTERS,
} from './actions-type';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ===============================
// 📊 DASHBOARD ACTIONS
// ===============================

export const fetchDashboard = (filters = {}) => async (dispatch) => {
  dispatch({ type: FETCH_DASHBOARD_REQUEST });

  try {
    const params = new URLSearchParams();
    
    if (filters.section) params.append('section', filters.section);
    if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.subCategoryId) params.append('subCategoryId', filters.subCategoryId);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = `${BASE_URL}/product/dashboard?${params.toString()}`;
    console.log('Fetching dashboard from:', url);
    
    const { data } = await axios.get(url);
    console.log('Dashboard response:', data);

    dispatch({
      type: FETCH_DASHBOARD_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    dispatch({
      type: FETCH_DASHBOARD_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ===============================
// 📦 STOCK OPERATIONS ACTIONS
// ===============================

export const addStock = (productId, stockData) => async (dispatch, getState) => {
  dispatch({ type: ADD_STOCK_REQUEST });

  try {
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      `${BASE_URL}/stock/${productId}/add`,
      stockData,
      config
    );

    dispatch({
      type: ADD_STOCK_SUCCESS,
      payload: data.data,
    });

    // Refrescar dashboard después de agregar stock
    dispatch(fetchDashboard());

    return { success: true, data: data.data };
  } catch (error) {
    dispatch({
      type: ADD_STOCK_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const removeStock = (productId, stockData) => async (dispatch, getState) => {
  dispatch({ type: REMOVE_STOCK_REQUEST });

  try {
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      `${BASE_URL}/stock/${productId}/remove`,
      stockData,
      config
    );

    dispatch({
      type: REMOVE_STOCK_SUCCESS,
      payload: data.data,
    });

    // Refrescar dashboard después de remover stock
    dispatch(fetchDashboard());

    return { success: true, data: data.data };
  } catch (error) {
    dispatch({
      type: REMOVE_STOCK_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const adjustStock = (productId, stockData) => async (dispatch, getState) => {
  dispatch({ type: ADJUST_STOCK_REQUEST });

  try {
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `${BASE_URL}/stock/${productId}/adjust`,
      stockData,
      config
    );

    dispatch({
      type: ADJUST_STOCK_SUCCESS,
      payload: data.data,
    });

    // Refrescar dashboard después de ajustar stock
    dispatch(fetchDashboard());

    return { success: true, data: data.data };
  } catch (error) {
    dispatch({
      type: ADJUST_STOCK_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

// ===============================
// 📜 STOCK HISTORY ACTIONS
// ===============================

export const fetchStockHistory = (productId, page = 1, limit = 20) => async (dispatch, getState) => {
  dispatch({ type: FETCH_STOCK_HISTORY_REQUEST });

  try {
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(
      `${BASE_URL}/stock/${productId}/history?page=${page}&limit=${limit}`,
      config
    );

    dispatch({
      type: FETCH_STOCK_HISTORY_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_STOCK_HISTORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ===============================
// 🚨 STOCK ALERTS ACTIONS
// ===============================

export const fetchLowStock = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_LOW_STOCK_REQUEST });

  try {
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${BASE_URL}/stock/low-stock`, config);

    dispatch({
      type: FETCH_LOW_STOCK_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_LOW_STOCK_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const fetchOutOfStock = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_OUT_OF_STOCK_REQUEST });

  try {
    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${BASE_URL}/stock/out-of-stock`, config);

    dispatch({
      type: FETCH_OUT_OF_STOCK_SUCCESS,
      payload: data.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_OUT_OF_STOCK_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ===============================
// 🔧 FILTER ACTIONS
// ===============================

export const setStockSectionFilter = (section) => ({
  type: SET_STOCK_SECTION_FILTER,
  payload: section,
});

export const setStockStatusFilter = (status) => ({
  type: SET_STOCK_STATUS_FILTER,
  payload: status,
});

export const clearStockFilters = () => ({
  type: CLEAR_STOCK_FILTERS,
});
