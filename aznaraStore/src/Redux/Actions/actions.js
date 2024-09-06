import { BASE_URL } from "../../Config";
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import {
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  FETCH_PRODUCTS_REQUEST,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAILURE,
  FETCH_PRODUCT_REQUEST,
  FETCH_PRODUCT_SUCCESS,
  FETCH_PRODUCT_FAILURE,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CLEAR_CART,
  INCREMENT_QUANTITY,
  DECREMENT_QUANTITY,
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  SET_SEARCH_TERM,
  SET_PRICE_FILTER,
  SET_CATEGORY_FILTER,
  CLEAR_ORDER_STATE,
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ALLS_ORDERS_REQUEST,
  FETCH_ALLS_ORDERS_SUCCESS,
  FETCH_ALLS_ORDERS_FAILURE,
  UPDATE_ORDER_STATE_SUCCESS,
  UPDATE_ORDER_STATE_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  CATEGORY_CREATE_REQUEST, 
  CATEGORY_CREATE_SUCCESS, 
  CATEGORY_CREATE_FAIL,
  FETCH_LATEST_ORDER_REQUEST,
  FETCH_LATEST_ORDER_SUCCESS,
  FETCH_LATEST_ORDER_FAILURE,

} from './actions-type';

export const createProduct = (productData) => async (dispatch) => {
  dispatch({ type: CREATE_PRODUCT_REQUEST });

  try {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('id_category', productData.id_category);
    formData.append('section', productData.section)
    formData.append('isOffer', productData.isOffer)

    if (productData.sizes) {
      formData.append('sizes', JSON.stringify(productData.sizes));
    }

    if (productData.colors) {
      formData.append('colors', JSON.stringify(productData.colors));
    }

    productData.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await axios.post(`${BASE_URL}/product/createProducts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: response.data });
    dispatch(fetchProducts());
  } catch (error) {
    dispatch({ type: CREATE_PRODUCT_FAILURE, payload: error.message });
  }
};



export const fetchCategories = () => async (dispatch) => {
  dispatch({ type: FETCH_CATEGORIES_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/category/`);
    dispatch({ type: FETCH_CATEGORIES_SUCCESS, payload: response.data.data.categories });
  } catch (error) {
    dispatch({ type: FETCH_CATEGORIES_FAILURE, payload: error.message });
  }
};

export const fetchProducts = () => async (dispatch) => {
  dispatch({ type: FETCH_PRODUCTS_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/product/`);
    dispatch({ type: FETCH_PRODUCTS_SUCCESS, payload: response.data.data.products });
  } catch (error) {
    dispatch({ type: FETCH_PRODUCTS_FAILURE, payload: error.message });
  }
};

export const fetchProductById = (id) => async (dispatch) => {
  dispatch({ type: FETCH_PRODUCT_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/product/${id}`);
    dispatch({ type: FETCH_PRODUCT_SUCCESS, payload: response.data.data.product });
  } catch (error) {
    dispatch({ type: FETCH_PRODUCT_FAILURE, payload: error.message });
  }
};

export const addToCart = (product) => ({
  type: ADD_TO_CART,
  payload: product,
});

export const removeFromCart = (productId) => ({
  type: REMOVE_FROM_CART,
  payload: productId,
});

export const clearCart = () => ({
  type: CLEAR_CART,
});

export const incrementQuantity = (productId) => ({
  type: INCREMENT_QUANTITY,
  payload: productId,
});

export const decrementQuantity = (productId) => ({
  type: DECREMENT_QUANTITY,
  payload: productId,
});

export const createOrder = (orderData) => async (dispatch) => {
  try {
    dispatch({ type: ORDER_CREATE_REQUEST });

    const { data } = await axios.post(`${BASE_URL}/order/create/`, orderData);

    dispatch({
      type: ORDER_CREATE_SUCCESS,
      payload: data.data.orderDetail,
    });
    dispatch(clearCart());
    localStorage.removeItem('cartItems');

  } catch (error) {
    dispatch({
      type: ORDER_CREATE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

export const fetchLatestOrder = () => async (dispatch) => {
  dispatch({ type: FETCH_LATEST_ORDER_REQUEST });
  try {
    const { data } = await axios.get(`${BASE_URL}/order?latest=true`);
    dispatch({ type: FETCH_LATEST_ORDER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_LATEST_ORDER_FAILURE, payload: error.response.data });
  }
};


export const clearOrderState = () => ({
  type: CLEAR_ORDER_STATE,
});


export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(`${BASE_URL}/user`,userData, config)
   

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(`${BASE_URL}/auth/login`,{ email, password }, config);

      // Decodifica el token para obtener el rol del usuario
      const decodedToken = jwtDecode(data.data.token);
      const userInfo = {
        token: data.token,
        role: decodedToken.role,
        n_document: decodedToken.n_document, // Agregar n_document desde el token decodificado
        message: data.message,
      };

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: userInfo,
    });

    localStorage.setItem('userInfo', JSON.stringify(userInfo));
     } catch (error) {
       dispatch({
         type: USER_LOGIN_FAIL,
         payload: error.response && error.response.data.message ? error.response.data.message : error.message,
       });
     }
   };

export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  dispatch({ type: USER_LOGOUT });
};


export const setSearchTerm = (term) => ({
  type: SET_SEARCH_TERM,
  payload: term,
});

export const setPriceFilter = (price) => ({
  type: SET_PRICE_FILTER,
  payload: price,
});

export const setCategoryFilter = (category) => ({
  type: SET_CATEGORY_FILTER,
  payload: category,
});

export const fetchFilteredProducts = (searchTerm, priceFilter, categoryName) => async (dispatch) => {
  dispatch({ type: FETCH_PRODUCTS_REQUEST });

  try {
    let url = `${BASE_URL}/product?search=${searchTerm}`;
    
    if (priceFilter && priceFilter.min !== null && priceFilter.max !== null) {
      url += `&minPrice=${priceFilter.min}&maxPrice=${priceFilter.max}`;
    }
    
    if (categoryName) {
      url += `&categoryName=${categoryName}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.error && data.data && data.data.products) {
      dispatch({ type: FETCH_PRODUCTS_SUCCESS, payload: data.data.products });
    } else {
      dispatch({ type: FETCH_PRODUCTS_FAILURE, payload: data.message });
    }
  } catch (error) {
    dispatch({ type: FETCH_PRODUCTS_FAILURE, payload: error.message });
  }
};




export const fetchOrdersByDocument = (n_document) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ORDERS_REQUEST });

    const { data } = await axios.get(`${BASE_URL}/order/${n_document}`);
    

    dispatch({ type: FETCH_ORDERS_SUCCESS, payload: data.data.orders });
  } catch (error) {
    dispatch({
      type: FETCH_ORDERS_FAILURE,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

export const fetchAllOrders = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ALLS_ORDERS_REQUEST });

    const { data } = await axios.get(`${BASE_URL}/order`); 
    console.log('API response data:', data);

    dispatch({ type: FETCH_ALLS_ORDERS_SUCCESS, payload: data.data.orders });
  } catch (error) {
    dispatch({
      type: FETCH_ALLS_ORDERS_FAILURE,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

export const updateOrderState = (id_orderDetail, newState, trackingNumber) => async (dispatch) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/order/${id_orderDetail}`, { state_order: newState , trackingNumber});

    dispatch({ type: UPDATE_ORDER_STATE_SUCCESS, payload: data.orderDetail });
    // Puedes manejar un mensaje de éxito o hacer otras acciones después de actualizar el estado
  } catch (error) {
    dispatch({ type: UPDATE_ORDER_STATE_FAILURE, payload: error.message });
    // Manejar errores o mostrar mensajes de error al usuario si es necesario
  }
};

export const updateProduct = (id, productData) => async (dispatch) => {
  dispatch({ type: UPDATE_PRODUCT_REQUEST });

  try {
    const response = await axios.put(`${BASE_URL}/product/updateProducts/${id}`, productData);
    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: response.data.data.product });
  } catch (error) {
    dispatch({ type: UPDATE_PRODUCT_FAILURE, payload: error.message });
  }
};

export const deleteProduct = (id_product) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });

    await axios.delete(`${BASE_URL}/product/deleteProducts/${id_product}`);

    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: id_product });
  } catch (error) {
    dispatch({
      type: DELETE_PRODUCT_FAILURE,
      payload: error.message,
    });
  }
};

export const createCategory = (name_category) => async (dispatch, getState) => {
  try {
    dispatch({ type: CATEGORY_CREATE_REQUEST });

    // Fetch categories first
    const categories = await dispatch(fetchCategories());

    // Check if categories is defined and not null
    if (categories && categories.length) {
      // Check if category already exists
      const categoryExists = categories.some(
        (category) => category.name_category.toLowerCase() === name_category.toLowerCase()
      );

      if (categoryExists) {
        dispatch({ type: CATEGORY_CREATE_FAIL, payload: 'Category already exists' });
        return { type: CATEGORY_CREATE_FAIL, error: 'Category already exists' };
      }
    }

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(`${BASE_URL}/category/createCategory`, { name_category }, config);

    dispatch({ type: CATEGORY_CREATE_SUCCESS, payload: data });
    return { type: CATEGORY_CREATE_SUCCESS };
  } catch (error) {
    dispatch({
      type: CATEGORY_CREATE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
    return { type: CATEGORY_CREATE_FAIL, error: error.response ? error.response.data.message : error.message };
  }
};
