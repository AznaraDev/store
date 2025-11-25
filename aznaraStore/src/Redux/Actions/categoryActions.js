import axios from '../../axiosConfig';
import { BASE_URL } from '../../Config';
import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  FETCH_SUBCATEGORIES_REQUEST,
  FETCH_SUBCATEGORIES_SUCCESS,
  FETCH_SUBCATEGORIES_FAILURE,
  CREATE_SUBCATEGORY_REQUEST,
  CREATE_SUBCATEGORY_SUCCESS,
  CREATE_SUBCATEGORY_FAILURE,
  UPDATE_SUBCATEGORY_REQUEST,
  UPDATE_SUBCATEGORY_SUCCESS,
  UPDATE_SUBCATEGORY_FAILURE,
  DELETE_SUBCATEGORY_REQUEST,
  DELETE_SUBCATEGORY_SUCCESS,
  DELETE_SUBCATEGORY_FAILURE,
} from './actions-type';

// ==================== CATEGORÍAS ====================

/**
 * Obtener todas las categorías
 */
export const fetchCategories = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_CATEGORIES_REQUEST });

    const { data } = await axios.get(`${BASE_URL}/category`);

    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: data.data,
    });

    return { success: true, data: data.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    dispatch({
      type: FETCH_CATEGORIES_FAILURE,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Crear nueva categoría
 */
export const createCategory = (categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_CATEGORY_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      `${BASE_URL}/category/createCategory`,
      categoryData,
      config
    );

    console.log('Create category response:', data);

    dispatch({
      type: CREATE_CATEGORY_SUCCESS,
      payload: data.data.category,
    });

    return { success: true, category: data.data.category };
  } catch (error) {
    const message = error.response?.data?.message?.error 
      || error.response?.data?.error 
      || error.message;
    dispatch({
      type: CREATE_CATEGORY_FAILURE,
      payload: message,
    });
    return { success: false, error: message };
  }
};

/**
 * Actualizar categoría
 */
export const updateCategory = (id, categoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_CATEGORY_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `${BASE_URL}/category/${id}`,
      categoryData,
      config
    );

    dispatch({
      type: UPDATE_CATEGORY_SUCCESS,
      payload: data.category,
    });

    return { success: true, category: data.category };
  } catch (error) {
    const message = error.response?.data?.message?.error 
      || error.response?.data?.error 
      || error.message;
    dispatch({
      type: UPDATE_CATEGORY_FAILURE,
      payload: message,
    });
    return { success: false, error: message };
  }
};

/**
 * Eliminar categoría
 */
export const deleteCategory = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_CATEGORY_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.delete(
      `${BASE_URL}/category/${id}`,
      config
    );

    dispatch({
      type: DELETE_CATEGORY_SUCCESS,
      payload: id,
    });

    return { success: true, message: data.message };
  } catch (error) {
    const message = error.response?.data?.message?.error 
      || error.response?.data?.error 
      || error.message;
    dispatch({
      type: DELETE_CATEGORY_FAILURE,
      payload: message,
    });
    return { success: false, error: message };
  }
};

// ==================== SUBCATEGORÍAS ====================

/**
 * Obtener subcategorías (opcionalmente filtradas por categoría)
 */
export const fetchSubCategories = (categoryId = null) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_SUBCATEGORIES_REQUEST });

    const url = categoryId 
      ? `${BASE_URL}/category/subcategory?categoryId=${categoryId}`
      : `${BASE_URL}/category/subcategory`;

    const { data } = await axios.get(url);

    dispatch({
      type: FETCH_SUBCATEGORIES_SUCCESS,
      payload: data.subCategories,
    });

    return { success: true, subCategories: data.subCategories };
  } catch (error) {
    const message = error.response?.data?.message?.error 
      || error.response?.data?.error 
      || error.message;
    dispatch({
      type: FETCH_SUBCATEGORIES_FAILURE,
      payload: message,
    });
    return { success: false, error: message };
  }
};

/**
 * Crear subcategoría
 */
export const createSubCategory = (subCategoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_SUBCATEGORY_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      `${BASE_URL}/category/subcategory`,
      subCategoryData,
      config
    );

    console.log('Create subcategory response:', data);

    dispatch({
      type: CREATE_SUBCATEGORY_SUCCESS,
      payload: data.data.subCategory,
    });

    return { success: true, subCategory: data.data.subCategory };
  } catch (error) {
    const message = error.response?.data?.message?.error 
      || error.response?.data?.error 
      || error.message;
    dispatch({
      type: CREATE_SUBCATEGORY_FAILURE,
      payload: message,
    });
    return { success: false, error: message };
  }
};

/**
 * Actualizar subcategoría
 */
export const updateSubCategory = (id, subCategoryData) => async (dispatch, getState) => {
  try {
    dispatch({ type: UPDATE_SUBCATEGORY_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `${BASE_URL}/category/subcategory/${id}`,
      subCategoryData,
      config
    );

    console.log('Update subcategory response:', data);

    dispatch({
      type: UPDATE_SUBCATEGORY_SUCCESS,
      payload: data.data.subCategory,
    });

    return { success: true, subCategory: data.data.subCategory };
  } catch (error) {
    const message = error.response?.data?.message?.error 
      || error.response?.data?.error 
      || error.message;
    dispatch({
      type: UPDATE_SUBCATEGORY_FAILURE,
      payload: message,
    });
    return { success: false, error: message };
  }
};

/**
 * Eliminar subcategoría
 */
export const deleteSubCategory = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: DELETE_SUBCATEGORY_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.delete(
      `${BASE_URL}/category/subcategory/${id}`,
      config
    );

    dispatch({
      type: DELETE_SUBCATEGORY_SUCCESS,
      payload: id,
    });

    return { success: true, message: data.message };
  } catch (error) {
    const message = error.response?.data?.message?.error 
      || error.response?.data?.error 
      || error.message;
    dispatch({
      type: DELETE_SUBCATEGORY_FAILURE,
      payload: message,
    });
    return { success: false, error: message };
  }
};
