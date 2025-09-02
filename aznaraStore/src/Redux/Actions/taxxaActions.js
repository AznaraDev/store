import axios from 'axios';
import { BASE_URL } from '../../Config';
import {
  // Buyer actions
  FETCH_BUYER_REQUEST,
  FETCH_BUYER_SUCCESS,
  FETCH_BUYER_FAILURE,
  CREATE_BUYER_REQUEST,
  CREATE_BUYER_SUCCESS,
  CREATE_BUYER_FAILURE,
  
  // Seller actions
  FETCH_SELLER_REQUEST,
  FETCH_SELLER_SUCCESS,
  FETCH_SELLER_FAILURE,
  CREATE_SELLER_REQUEST,
  CREATE_SELLER_SUCCESS,
  CREATE_SELLER_FAILURE,
  UPDATE_SELLER_REQUEST,
  UPDATE_SELLER_SUCCESS,
  UPDATE_SELLER_FAILURE,
  
  // Bill actions
  GENERATE_BILL_REQUEST,
  GENERATE_BILL_SUCCESS,
  GENERATE_BILL_FAILURE,
  FETCH_BILLS_REQUEST,
  FETCH_BILLS_SUCCESS,
  FETCH_BILLS_FAILURE,
  FETCH_BILL_BY_ID_REQUEST,
  FETCH_BILL_BY_ID_SUCCESS,
  FETCH_BILL_BY_ID_FAILURE,
  
  // Invoice actions
  SEND_INVOICE_REQUEST,
  SEND_INVOICE_SUCCESS,
  SEND_INVOICE_FAILURE,
  GET_ALL_INVOICES_REQUEST,
  GET_ALL_INVOICES_SUCCESS,
  GET_ALL_INVOICES_FAILURE,
  GET_INVOICE_BY_ID_REQUEST,
  GET_INVOICE_BY_ID_SUCCESS,
  GET_INVOICE_BY_ID_FAILURE,
  
  // Credit Note actions
  CREATE_CREDIT_NOTE_REQUEST,
  CREATE_CREDIT_NOTE_SUCCESS,
  CREATE_CREDIT_NOTE_FAILURE,

  // Manual Invoice actions
  CREATE_MANUAL_INVOICE_REQUEST,
  CREATE_MANUAL_INVOICE_SUCCESS,
  CREATE_MANUAL_INVOICE_FAILURE,
  GET_MANUAL_INVOICE_DATA_REQUEST,
  GET_MANUAL_INVOICE_DATA_SUCCESS,
  GET_MANUAL_INVOICE_DATA_FAILURE,
  CLEAR_MANUAL_INVOICE_DATA,

  // Utility actions
  CLEAR_TAXXA_STATE,
  SET_TAXXA_ERROR
} from './actions-type';

// ===============================
// 👤 BUYER ACTIONS
// ===============================

// Obtener buyer por documento
export const fetchBuyerByDocument = (document) => async (dispatch) => {
  dispatch({ type: FETCH_BUYER_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/buyer/${document}`);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: FETCH_BUYER_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Buyer no encontrado";
      dispatch({ type: FETCH_BUYER_FAILURE, payload: errorMsg });
      return null;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al obtener buyer";
    dispatch({ type: FETCH_BUYER_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Crear nuevo buyer
export const createBuyer = (buyerData) => async (dispatch) => {
  dispatch({ type: CREATE_BUYER_REQUEST });

  try {
    const response = await axios.post(`${BASE_URL}/buyer`, buyerData);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: CREATE_BUYER_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Error al crear buyer";
      dispatch({ type: CREATE_BUYER_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al crear buyer";
    dispatch({ type: CREATE_BUYER_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Verificar o crear buyer
export const checkOrCreateBuyer = (document) => async (dispatch) => {
  try {
    // Primero intentar obtener el buyer existente
    const existingBuyer = await dispatch(fetchBuyerByDocument(document));
    
    if (existingBuyer) {
      return existingBuyer;
    }
    
    // Si no existe, obtener datos del usuario para crear buyer
    const userResponse = await axios.get(`${BASE_URL}/user/document/${document}`);
    
    if (userResponse.data.success && userResponse.data.data) {
      const user = userResponse.data.data;
      
      const buyerData = {
        document: user.n_document,
        name: user.name,
        email: user.email,
        documentType: 'CC', // Por defecto cédula
        address: user.address || 'Dirección por definir',
        city: user.city || 'Bogotá',
        phone: user.phone || '3000000000'
      };
      
      return await dispatch(createBuyer(buyerData));
    } else {
      throw new Error("Usuario no encontrado para crear buyer");
    }
  } catch (error) {
    console.error('Error en checkOrCreateBuyer:', error);
    throw error;
  }
};

// ===============================
// 🏢 SELLER ACTIONS
// ===============================

// Obtener seller por documento/NIT
export const fetchSellerByDocument = (document) => async (dispatch) => {
  dispatch({ type: FETCH_SELLER_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/seller/${document}`);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: FETCH_SELLER_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Seller no encontrado";
      dispatch({ type: FETCH_SELLER_FAILURE, payload: errorMsg });
      return null;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al obtener seller";
    dispatch({ type: FETCH_SELLER_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Crear nuevo seller
export const createSeller = (sellerData) => async (dispatch) => {
  dispatch({ type: CREATE_SELLER_REQUEST });

  try {
    const response = await axios.post(`${BASE_URL}/seller`, sellerData);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: CREATE_SELLER_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Error al crear seller";
      dispatch({ type: CREATE_SELLER_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al crear seller";
    dispatch({ type: CREATE_SELLER_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Actualizar seller
export const updateSeller = (document, sellerData) => async (dispatch) => {
  dispatch({ type: UPDATE_SELLER_REQUEST });

  try {
    const response = await axios.put(`${BASE_URL}/seller/${document}`, sellerData);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: UPDATE_SELLER_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Error al actualizar seller";
      dispatch({ type: UPDATE_SELLER_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al actualizar seller";
    dispatch({ type: UPDATE_SELLER_FAILURE, payload: errorMsg });
    throw error;
  }
};

// ===============================
// 📋 BILL ACTIONS
// ===============================

// Generar bill desde OrderDetail
export const generateBill = (orderDetailId) => async (dispatch) => {
  dispatch({ type: GENERATE_BILL_REQUEST });

  try {
    const response = await axios.post(`${BASE_URL}/bill/generate/${orderDetailId}`);
    
    // ✅ MANEJAR AMBAS ESTRUCTURAS: nueva (success: true) y antigua (error: false)
    const isSuccess = response.data.success === true || response.data.error === false;
    const responseData = response.data.data;
    
    if (isSuccess && responseData) {
      dispatch({ 
        type: GENERATE_BILL_SUCCESS, 
        payload: responseData 
      });
      return responseData;
    } else {
      const errorMsg = response.data.message || "Error al generar bill";
      dispatch({ type: GENERATE_BILL_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al generar bill";
    dispatch({ type: GENERATE_BILL_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Obtener todas las bills
export const fetchAllBills = (page = 1, limit = 10) => async (dispatch) => {
  dispatch({ type: FETCH_BILLS_REQUEST });

  try {
    console.log('🚀 [FETCH-BILLS] Iniciando petición al backend...');
    const response = await axios.get(`${BASE_URL}/bill?page=${page}&limit=${limit}`);
    
    console.log('📡 [FETCH-BILLS] Respuesta del backend:', response.data);
    console.log('📊 [FETCH-BILLS] Status code:', response.status);
    
    // ✅ MANEJAR AMBAS ESTRUCTURAS: nueva (success: true) y antigua (error: false)
    const isSuccess = response.data.success === true || response.data.error === false;
    const responseData = response.data.data;
    
    if (isSuccess && responseData) {
      console.log('✅ [FETCH-BILLS] Bills obtenidas exitosamente:', responseData);
      dispatch({ 
        type: FETCH_BILLS_SUCCESS, 
        payload: responseData 
      });
      return responseData;
    } else {
      console.error('❌ [FETCH-BILLS] Backend respondió sin success/data:', response.data);
      const errorMsg = response.data.message || "Error al obtener bills";
      dispatch({ type: FETCH_BILLS_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('💥 [FETCH-BILLS] Error en la petición:', error);
    console.error('💥 [FETCH-BILLS] Error response:', error.response?.data);
    const errorMsg = error.response?.data?.message || error.message || "Error al obtener bills";
    dispatch({ type: FETCH_BILLS_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Obtener bill por ID
export const fetchBillById = (billId) => async (dispatch) => {
  dispatch({ type: FETCH_BILL_BY_ID_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/bill/${billId}`);
    
    // ✅ MANEJAR AMBAS ESTRUCTURAS: nueva (success: true) y antigua (error: false)  
    const isSuccess = response.data.success === true || response.data.error === false;
    const responseData = response.data.data;
    
    if (isSuccess && responseData) {
      dispatch({ 
        type: FETCH_BILL_BY_ID_SUCCESS, 
        payload: responseData 
      });
      return responseData;
    } else {
      const errorMsg = response.data.message || "Bill no encontrada";
      dispatch({ type: FETCH_BILL_BY_ID_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al obtener bill";
    dispatch({ type: FETCH_BILL_BY_ID_FAILURE, payload: errorMsg });
    throw error;
  }
};

// ===============================
// 🧾 INVOICE ACTIONS
// ===============================

// Enviar invoice a Taxxa desde Bill
export const sendInvoiceFromBill = (billId, contingency = false) => async (dispatch) => {
  dispatch({ type: SEND_INVOICE_REQUEST });

  try {
    const response = await axios.post(`${BASE_URL}/invoice/send-from-bill`, {
      billId,
      contingency
    });
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: SEND_INVOICE_SUCCESS, 
        payload: {
          ...response.data.data,
          isContingency: contingency
        }
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Error al enviar invoice a Taxxa";
      dispatch({ type: SEND_INVOICE_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al enviar invoice";
    dispatch({ type: SEND_INVOICE_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Obtener todas las invoices
export const fetchAllInvoices = (page = 1, limit = 10) => async (dispatch) => {
  dispatch({ type: GET_ALL_INVOICES_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/invoice?page=${page}&limit=${limit}`);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: GET_ALL_INVOICES_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Error al obtener invoices";
      dispatch({ type: GET_ALL_INVOICES_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al obtener invoices";
    dispatch({ type: GET_ALL_INVOICES_FAILURE, payload: errorMsg });
    throw error;
  }
};

// Obtener invoice por ID
export const fetchInvoiceById = (invoiceId) => async (dispatch) => {
  dispatch({ type: GET_INVOICE_BY_ID_REQUEST });

  try {
    const response = await axios.get(`${BASE_URL}/invoice/${invoiceId}`);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: GET_INVOICE_BY_ID_SUCCESS, 
        payload: response.data.data 
      });
      return response.data.data;
    } else {
      const errorMsg = response.data.message || "Invoice no encontrada";
      dispatch({ type: GET_INVOICE_BY_ID_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Error al obtener invoice";
    dispatch({ type: GET_INVOICE_BY_ID_FAILURE, payload: errorMsg });
    throw error;
  }
};

// ===============================
// 🧾 MANUAL INVOICE ACTIONS
// ===============================

// Crear factura manual
export const createManualInvoice = (invoiceData) => async (dispatch) => {
  dispatch({ type: CREATE_MANUAL_INVOICE_REQUEST });

  try {
    console.log('📤 Enviando factura manual a backend:', invoiceData);
    
    const response = await axios.post(`${BASE_URL}/invoice/manual`, invoiceData);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: CREATE_MANUAL_INVOICE_SUCCESS, 
        payload: response.data.data 
      });
      
      console.log('✅ Factura manual creada exitosamente:', response.data.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Factura manual creada exitosamente'
      };
    } else {
      const errorMsg = response.data.message || "Error al crear factura manual";
      dispatch({ type: CREATE_MANUAL_INVOICE_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('❌ Error creando factura manual:', error);
    
    const errorMsg = error.response?.data?.message || error.message || "Error al crear factura manual";
    dispatch({ type: CREATE_MANUAL_INVOICE_FAILURE, payload: errorMsg });
    
    return {
      success: false,
      error: errorMsg,
      message: 'Error al crear la factura manual'
    };
  }
};

// Obtener datos para factura manual (configuraciones, catálogos, etc.)
export const getManualInvoiceData = () => async (dispatch) => {
  dispatch({ type: GET_MANUAL_INVOICE_DATA_REQUEST });

  try {
    console.log('📊 Obteniendo datos para factura manual...');
    
    const response = await axios.get(`${BASE_URL}/invoice/manual/data`);
    
    if (response.data.success && response.data.data) {
      dispatch({ 
        type: GET_MANUAL_INVOICE_DATA_SUCCESS, 
        payload: response.data.data 
      });
      
      console.log('✅ Datos para factura manual obtenidos:', response.data.data);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Datos obtenidos exitosamente'
      };
    } else {
      const errorMsg = response.data.message || "Error al obtener datos para factura manual";
      dispatch({ type: GET_MANUAL_INVOICE_DATA_FAILURE, payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos para factura manual:', error);
    
    const errorMsg = error.response?.data?.message || error.message || "Error al obtener datos";
    dispatch({ type: GET_MANUAL_INVOICE_DATA_FAILURE, payload: errorMsg });
    
    return {
      success: false,
      error: errorMsg,
      message: 'Error al obtener los datos necesarios'
    };
  }
};

// Limpiar datos de factura manual
export const clearManualInvoiceData = () => ({
  type: CLEAR_MANUAL_INVOICE_DATA
});

// ===============================
// 🔧 UTILITY ACTIONS
// ===============================

// Limpiar estado de Taxxa
export const clearTaxxaState = () => ({
  type: CLEAR_TAXXA_STATE
});

// Establecer error
export const setTaxxaError = (error) => ({
  type: SET_TAXXA_ERROR,
  payload: error
});

// ===============================
// 🚀 FLUJO COMPLETO E-COMMERCE
// ===============================

// Procesar pedido completo: OrderDetail → Bill → Invoice
export const processOrderInvoice = (orderDetailId, contingency = false) => async (dispatch) => {
  try {
    console.log('🚀 Iniciando proceso completo de facturación para:', orderDetailId);
    
    // 1. Generar Bill desde OrderDetail
    console.log('📋 Paso 1: Generando Bill...');
    const bill = await dispatch(generateBill(orderDetailId));
    
    if (!bill) {
      throw new Error("No se pudo generar la Bill");
    }
    
    console.log('✅ Bill generada:', bill.id);
    
    // 2. Verificar/crear buyer
    console.log('👤 Paso 2: Verificando Buyer...');
    const userDocument = bill.User?.n_document;
    
    if (!userDocument) {
      throw new Error("Usuario sin documento de identidad");
    }
    
    const buyer = await dispatch(checkOrCreateBuyer(userDocument));
    
    if (!buyer) {
      throw new Error("No se pudo crear/obtener el buyer");
    }
    
    console.log('✅ Buyer verificado:', buyer.document);
    
    // 3. Enviar invoice a Taxxa
    console.log('🧾 Paso 3: Enviando Invoice a Taxxa...');
    const invoice = await dispatch(sendInvoiceFromBill(bill.id, contingency));
    
    console.log('✅ Proceso completo exitoso. Invoice:', invoice.id);
    
    return {
      bill,
      buyer,
      invoice,
      success: true,
      message: 'Facturación procesada exitosamente'
    };
    
  } catch (error) {
    console.error('❌ Error en proceso completo:', error);
    dispatch(setTaxxaError(error.message));
    
    return {
      success: false,
      error: error.message,
      message: 'Error en el proceso de facturación'
    };
  }
};

// ===============================
// 💳 CREDIT NOTE ACTIONS
// ===============================

export const createCreditNote = (creditNoteData) => async (dispatch) => {
  dispatch({ type: CREATE_CREDIT_NOTE_REQUEST });
  
  try {
    console.log('🔄 Creando nota crédito...', creditNoteData);
    
    const response = await axios.post(`${BASE_URL}/invoice/credit-note`, creditNoteData);
    
    if (response.data.success) {
      dispatch({
        type: CREATE_CREDIT_NOTE_SUCCESS,
        payload: response.data.data
      });
      
      console.log('✅ Nota crédito creada exitosamente');
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Nota crédito creada exitosamente'
      };
    } else {
      throw new Error(response.data.message || 'Error al crear la nota crédito');
    }
    
  } catch (error) {
    console.error('❌ Error creando nota crédito:', error);
    
    const errorMessage = error.response?.data?.message || error.message || 'Error al crear la nota crédito';
    
    dispatch({
      type: CREATE_CREDIT_NOTE_FAILURE,
      payload: errorMessage
    });
    
    return {
      success: false,
      error: errorMessage,
      message: 'Error al crear la nota crédito'
    };
  }
};
