/* eslint-disable no-case-declarations */
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
  SB_CREATE_REQUEST,
  SB_CREATE_SUCCESS,
  SB_CREATE_FAIL,
  FETCH_LATEST_ORDER_REQUEST,
  FETCH_LATEST_ORDER_SUCCESS,
  FETCH_LATEST_ORDER_FAILURE,
  FETCH_SB_REQUEST,
  FETCH_SB_SUCCESS,
  FETCH_SB_FAILURE,
  SET_SUBCATEGORY_FILTER,
  
  // Taxxa action types
  FETCH_BUYER_REQUEST,
  FETCH_BUYER_SUCCESS,
  FETCH_BUYER_FAILURE,
  CREATE_BUYER_REQUEST,
  CREATE_BUYER_SUCCESS,
  CREATE_BUYER_FAILURE,
  FETCH_SELLER_REQUEST,
  FETCH_SELLER_SUCCESS,
  FETCH_SELLER_FAILURE,
  CREATE_SELLER_REQUEST,
  CREATE_SELLER_SUCCESS,
  CREATE_SELLER_FAILURE,
  UPDATE_SELLER_REQUEST,
  UPDATE_SELLER_SUCCESS,
  UPDATE_SELLER_FAILURE,
  GENERATE_BILL_REQUEST,
  GENERATE_BILL_SUCCESS,
  GENERATE_BILL_FAILURE,
  FETCH_BILLS_REQUEST,
  FETCH_BILLS_SUCCESS,
  FETCH_BILLS_FAILURE,
  FETCH_BILL_BY_ID_REQUEST,
  FETCH_BILL_BY_ID_SUCCESS,
  FETCH_BILL_BY_ID_FAILURE,
  SEND_INVOICE_REQUEST,
  SEND_INVOICE_SUCCESS,
  SEND_INVOICE_FAILURE,
  GET_ALL_INVOICES_REQUEST,
  GET_ALL_INVOICES_SUCCESS,
  GET_ALL_INVOICES_FAILURE,
  GET_INVOICE_BY_ID_REQUEST,
  GET_INVOICE_BY_ID_SUCCESS,
  GET_INVOICE_BY_ID_FAILURE,
  CREATE_CREDIT_NOTE_REQUEST,
  CREATE_CREDIT_NOTE_SUCCESS,
  CREATE_CREDIT_NOTE_FAILURE,
  GET_MANUAL_INVOICE_DATA_REQUEST,
  GET_MANUAL_INVOICE_DATA_SUCCESS,
  GET_MANUAL_INVOICE_DATA_FAILURE,
  CREATE_MANUAL_INVOICE_REQUEST,
  CREATE_MANUAL_INVOICE_SUCCESS,
  CREATE_MANUAL_INVOICE_FAILURE,
  CLEAR_MANUAL_INVOICE_DATA,
  CLEAR_TAXXA_STATE,
  SET_TAXXA_ERROR
} from "../Actions/actions-type";

const initialState = {
  searchTerm: "",
  priceFilter: { min: null, max: null },
  categoryFilter: null, // Es mejor null que "" para indicar "sin filtro"
  subCategoryFilter: null, 
  searchResults: [],
  loading: false,
  product: null,
  similarProducts: [],
  products: [],
  error: null,

  userRegister: {
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    loading: false,
    error: null,
  },
  userLogin: {
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    loading: false,
    error: null,
  },
  categories: {
    loading: false,
    data: [],
    error: null,
  },
  subCategories: {
    loading: false,
    data: [],
    error: null,
  },
  cart: {
    items: localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [],
    totalItems: localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart")).reduce(
          (acc, item) => acc + item.quantity,
          0
        )
      : 0,
    totalPrice: localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart")).reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        )
      : 0,
  },
  order: {
    loading: false,
    success: false,
    error: null,
    order: {},
  },
  orders: {
    loading: false,
    orders: [],
    error: null,
  },
  ordersGeneral: {
    loading: false,
    orders: [],
    error: null,
  },
  updateProduct: {
    loading: false,
    roduct: null,
    error: null,
  },
  latestOrder: {
    loading: false,
    success: false,
    error: null,
    data: {},
  },
  
  // 🏦 TAXXA STATE
  taxxa: {
    // 👤 Buyer state
    buyer: {
      data: null,
      loading: false,
      error: null
    },
    
    // 🏢 Seller state
    seller: {
      data: null,
      loading: false,
      error: null
    },
    
    // 📋 Bills state
    bills: {
      data: [],
      currentBill: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    },
    
    // 🧾 Invoices state
    invoices: {
      data: [],
      currentInvoice: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    },
    
    // � Credit Notes state
    creditNotes: {
      data: [],
      currentCreditNote: null,
      loading: false,
      error: null
    },
    
    // 📄 Manual Invoice state
    manualInvoice: {
      data: null,
      items: [],
      buyer: null,
      loading: false,
      error: null,
      success: false
    },
    
    // �🔄 Process state
    processing: {
      loading: false,
      error: null,
      success: false,
      message: null
    },
    
    // 📊 General state
    loading: false,
    error: null,
    message: null
  }
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CREATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        product: action.payload,
      };
    case CREATE_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case FETCH_CATEGORIES_REQUEST:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: true,
        },
      };
    case FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: {
          loading: false,
          data: action.payload,
          error: null,
        },
      };
    case FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: false,
          error: action.payload,
        },
      };

    case FETCH_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_PRODUCT_SUCCESS:
      return {
        ...state,
        product: action.payload.product,
        similarProducts: action.payload.similarProducts, // Guarda los productos similares
        loading: false,
      };
    case FETCH_PRODUCT_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case ADD_TO_CART:
      const existingItem = state.cart.items.find(
        (item) => item.id_product === action.payload.id_product
      );
      if (existingItem) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.id_product === action.payload.id_product
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            totalItems: state.cart.totalItems + 1,
            totalPrice: state.cart.totalPrice + action.payload.price,
          },
        };
      } else {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: [...state.cart.items, { ...action.payload, quantity: 1 }],
            totalItems: state.cart.totalItems + 1,
            totalPrice: state.cart.totalPrice + action.payload.price,
          },
        };
      }
    case REMOVE_FROM_CART:
      const itemToRemove = state.cart.items.find(
        (item) => item.id_product === action.payload
      );
      if (!itemToRemove) return state;

      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(
            (item) => item.id_product !== action.payload
          ),
          totalItems: state.cart.totalItems - itemToRemove.quantity,
          totalPrice:
            state.cart.totalPrice - itemToRemove.price * itemToRemove.quantity,
        },
      };
    case INCREMENT_QUANTITY:
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((item) =>
            item.id_product === action.payload
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          totalItems: state.cart.totalItems + 1,
          totalPrice:
            state.cart.totalPrice +
            state.cart.items.find((item) => item.id_product === action.payload)
              .price,
        },
      };
    case DECREMENT_QUANTITY:
      const itemToDecrement = state.cart.items.find(
        (item) => item.id_product === action.payload
      );
      if (itemToDecrement.quantity === 1) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.filter(
              (item) => item.id_product !== action.payload
            ),
            totalItems: state.cart.totalItems - 1,
            totalPrice: state.cart.totalPrice - itemToDecrement.price,
          },
        };
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map((item) =>
            item.id_product === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
          totalItems: state.cart.totalItems - 1,
          totalPrice: state.cart.totalPrice - itemToDecrement.price,
        },
      };
    case CLEAR_CART:
      return {
        ...state,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      };
    case ORDER_CREATE_REQUEST:
      return {
        ...state,
        order: {
          ...state.order,
          loading: true,
          success: false,
          error: null,
        },
      };
    case ORDER_CREATE_SUCCESS:
      return {
        ...state,
        order: {
          ...state.order,
          loading: false,
          success: true,
          order: action.payload,
          error: null,
        },
      };
    case ORDER_CREATE_FAIL:
      return {
        ...state,
        order: {
          ...state.order,
          loading: false,
          success: false,
          error: action.payload,
        },
      };

    case USER_REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
      };
    case USER_REGISTER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          loading: true,
          error: null,
        },
      };
    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          loading: false,
          userInfo: action.payload,
          error: null,
        },
      };
    case USER_LOGIN_FAIL:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          loading: false,
          error: action.payload,
        },
      };
    case USER_LOGOUT:
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          userInfo: null,
        },
      };
    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
      };
    case SET_PRICE_FILTER:
      return {
        ...state,
        priceFilter: action.payload,
      };
    case SET_CATEGORY_FILTER:
      return {
        ...state,
        categoryFilter: action.payload,
      };
    case FETCH_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        products: action.payload,
      };
    case FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CLEAR_ORDER_STATE:
      return {
        ...state,
        order: {
          loading: false,
          success: false,
          order: null,
          error: null,
        },
      };
    case FETCH_ORDERS_REQUEST:
      return {
        ...state,
        orders: {
          ...state.orders,
          loading: true,
          error: null,
        },
      };
    case FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        orders: {
          loading: false,
          orders: action.payload,
          error: null,
        },
      };
    case FETCH_ORDERS_FAILURE:
      return {
        ...state,
        orders: {
          loading: false,
          orders: [],
          error: action.payload,
        },
      };
    case FETCH_ALLS_ORDERS_REQUEST:
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          loading: true,
          error: null,
        },
      };
    case FETCH_ALLS_ORDERS_SUCCESS:
      return {
        ...state,
        ordersGeneral: {
          loading: false,
          orders: action.payload,
          error: null,
        },
      };
    case FETCH_ALLS_ORDERS_FAILURE:
      return {
        ...state,
        ordersGeneral: {
          loading: false,
          orders: [],
          error: action.payload,
        },
      };
    case UPDATE_ORDER_STATE_SUCCESS:
      // Actualiza el estado de una orden específica dentro de ordersGeneral.orders
      const updatedOrders = state.ordersGeneral.orders.map(
        (order) => order.id_orderDetail === action.payload.id_orderDetail
      );
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          orders: updatedOrders,
          error: null,
        },
      };

    case UPDATE_ORDER_STATE_FAILURE:
      return {
        ...state,
        ordersGeneral: {
          ...state.ordersGeneral,
          error: action.payload,
        },
      };
    case UPDATE_PRODUCT_REQUEST:
      return {
        ...state,
        updateProduct: {
          ...state.updateProduct,
          loading: true,
        },
      };
    case UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        updateProduct: {
          ...state.updateProduct,
          loading: false,
          product: action.payload.product,
        },
      };
    case UPDATE_PRODUCT_FAILURE:
      return {
        ...state,
        updateProduct: {
          ...state.updateProduct,
          loading: false,
          error: action.payload,
        },
      };
    case DELETE_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.filter(
          (product) => product.id_product !== action.payload
        ),
      };
    case DELETE_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CATEGORY_CREATE_REQUEST:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: true,
        },
      };
    case CATEGORY_CREATE_SUCCESS:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: false,
          data: [...state.categories.data, action.payload.data.category],
        },
      };
    case CATEGORY_CREATE_FAIL:
      return {
        ...state,
        categories: {
          ...state.categories,
          loading: false,
          error: action.payload,
        },
      };
    case SB_CREATE_REQUEST:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: true,
        },
      };
    case SB_CREATE_SUCCESS:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: false,
          data: Array.isArray(state.subCategories.data)
            ? [...state.subCategories.data, action.payload.data.sb]
            : [action.payload.data.sb],
        },
      };
    case SB_CREATE_FAIL:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: false,
          error: action.payload,
        },
      };
    case FETCH_LATEST_ORDER_REQUEST:
      return {
        ...state,
        latestOrder: {
          ...state.latestOrder,
          loading: true,
          error: null,
        },
      };
    case FETCH_LATEST_ORDER_SUCCESS:
      return {
        ...state,
        latestOrder: {
          ...state.latestOrder,
          loading: false,
          success: true,
          data: action.payload.data,
        },
      };
    case FETCH_LATEST_ORDER_FAILURE:
      return {
        ...state,
        latestOrder: {
          ...state.latestOrder,
          loading: false,
          error: action.payload,
        },
      };

    case FETCH_SB_REQUEST:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: true,
        },
      };
    case FETCH_SB_SUCCESS:
      return {
        ...state,
        subCategories: {
          loading: false,
          data: action.payload,
          error: null,
        },
      };
    case FETCH_SB_FAILURE:
      return {
        ...state,
        subCategories: {
          ...state.subCategories,
          loading: false,
          error: action.payload,
        },
      };
       case 'SET_CATEGORY_FILTER':
      return {
        ...state,
        categoryFilter: action.payload,
        subCategoryFilter: null, // <--- RESETEAR SUBCATEGORÍA AL CAMBIAR CATEGORÍA
        // Opcional: resetear también la página actual si la tienes en Redux
        // currentPage: 1, 
      };

    case SET_SUBCATEGORY_FILTER: // <--- AÑADIR CASO PARA SUBCATEGORÍA
      return {
        ...state,
        subCategoryFilter: action.payload,
        // Opcional: resetear también la página actual si la tienes en Redux
        // currentPage: 1,
      };

    // ===============================
    // 🏦 TAXXA CASES
    // ===============================
    
    // 👤 BUYER CASES
    case FETCH_BUYER_REQUEST:
    case CREATE_BUYER_REQUEST:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          buyer: {
            ...state.taxxa.buyer,
            loading: true,
            error: null
          },
          loading: true,
          error: null
        }
      };

    case FETCH_BUYER_SUCCESS:
    case CREATE_BUYER_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          buyer: {
            data: action.payload,
            loading: false,
            error: null
          },
          loading: false,
          error: null,
          message: action.type === CREATE_BUYER_SUCCESS ? 'Buyer creado exitosamente' : null
        }
      };

    case FETCH_BUYER_FAILURE:
    case CREATE_BUYER_FAILURE:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          buyer: {
            ...state.taxxa.buyer,
            loading: false,
            error: action.payload
          },
          loading: false,
          error: action.payload
        }
      };

    // 🏢 SELLER CASES
    case FETCH_SELLER_REQUEST:
    case CREATE_SELLER_REQUEST:
    case UPDATE_SELLER_REQUEST:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          seller: {
            ...state.taxxa.seller,
            loading: true,
            error: null
          },
          loading: true,
          error: null
        }
      };

    case FETCH_SELLER_SUCCESS:
    case CREATE_SELLER_SUCCESS:
    case UPDATE_SELLER_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          seller: {
            data: action.payload,
            loading: false,
            error: null
          },
          loading: false,
          error: null,
          message: action.type === CREATE_SELLER_SUCCESS ? 'Seller creado exitosamente' :
                   action.type === UPDATE_SELLER_SUCCESS ? 'Seller actualizado exitosamente' : null
        }
      };

    case FETCH_SELLER_FAILURE:
    case CREATE_SELLER_FAILURE:
    case UPDATE_SELLER_FAILURE:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          seller: {
            ...state.taxxa.seller,
            loading: false,
            error: action.payload
          },
          loading: false,
          error: action.payload
        }
      };

    // 📋 BILL CASES
    case GENERATE_BILL_REQUEST:
    case FETCH_BILLS_REQUEST:
    case FETCH_BILL_BY_ID_REQUEST:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          bills: {
            ...state.taxxa.bills,
            loading: true,
            error: null
          },
          loading: true,
          error: null
        }
      };

    case GENERATE_BILL_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          bills: {
            ...state.taxxa.bills,
            currentBill: action.payload,
            data: [action.payload, ...state.taxxa.bills.data],
            loading: false,
            error: null
          },
          loading: false,
          error: null,
          message: 'Bill generada exitosamente'
        }
      };

    case FETCH_BILLS_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          bills: {
            ...state.taxxa.bills,
            data: action.payload.bills || action.payload,
            pagination: action.payload.pagination || state.taxxa.bills.pagination,
            loading: false,
            error: null
          },
          loading: false,
          error: null
        }
      };

    case FETCH_BILL_BY_ID_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          bills: {
            ...state.taxxa.bills,
            currentBill: action.payload,
            loading: false,
            error: null
          },
          loading: false,
          error: null
        }
      };

    case GENERATE_BILL_FAILURE:
    case FETCH_BILLS_FAILURE:
    case FETCH_BILL_BY_ID_FAILURE:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          bills: {
            ...state.taxxa.bills,
            loading: false,
            error: action.payload
          },
          loading: false,
          error: action.payload
        }
      };

    // 🧾 INVOICE CASES
    case SEND_INVOICE_REQUEST:
    case GET_ALL_INVOICES_REQUEST:
    case GET_INVOICE_BY_ID_REQUEST:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          invoices: {
            ...state.taxxa.invoices,
            loading: true,
            error: null
          },
          loading: true,
          error: null
        }
      };

    case SEND_INVOICE_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          invoices: {
            ...state.taxxa.invoices,
            currentInvoice: action.payload,
            data: action.payload.invoice ? 
              [action.payload.invoice, ...state.taxxa.invoices.data] : 
              state.taxxa.invoices.data,
            loading: false,
            error: null
          },
          loading: false,
          error: null,
          message: action.payload.isContingency ? 
            'Factura enviada con contingencia activada' : 
            'Factura enviada exitosamente a Taxxa'
        }
      };

    case GET_ALL_INVOICES_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          invoices: {
            ...state.taxxa.invoices,
            data: action.payload.invoices || action.payload,
            pagination: action.payload.pagination || state.taxxa.invoices.pagination,
            loading: false,
            error: null
          },
          loading: false,
          error: null
        }
      };

    case GET_INVOICE_BY_ID_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          invoices: {
            ...state.taxxa.invoices,
            currentInvoice: action.payload,
            loading: false,
            error: null
          },
          loading: false,
          error: null
        }
      };

    case SEND_INVOICE_FAILURE:
    case GET_ALL_INVOICES_FAILURE:
    case GET_INVOICE_BY_ID_FAILURE:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          invoices: {
            ...state.taxxa.invoices,
            loading: false,
            error: action.payload
          },
          loading: false,
          error: action.payload
        }
      };

    // 🔧 UTILITY CASES
    case CLEAR_TAXXA_STATE:
      return {
        ...state,
        taxxa: {
          buyer: { data: null, loading: false, error: null },
          seller: { data: null, loading: false, error: null },
          bills: { data: [], currentBill: null, loading: false, error: null, pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
          invoices: { data: [], currentInvoice: null, loading: false, error: null, pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
          processing: { loading: false, error: null, success: false, message: null },
          loading: false,
          error: null,
          message: null
        }
      };

    case SET_TAXXA_ERROR:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          error: action.payload,
          loading: false
        }
      };

    // 📝 Credit Note actions
    case CREATE_CREDIT_NOTE_REQUEST:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          creditNotes: {
            ...state.taxxa.creditNotes,
            loading: true,
            error: null
          }
        }
      };

    case CREATE_CREDIT_NOTE_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          creditNotes: {
            ...state.taxxa.creditNotes,
            loading: false,
            data: [...state.taxxa.creditNotes.data, action.payload],
            currentCreditNote: action.payload,
            error: null
          }
        }
      };

    case CREATE_CREDIT_NOTE_FAILURE:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          creditNotes: {
            ...state.taxxa.creditNotes,
            loading: false,
            error: action.payload
          }
        }
      };

    // 📄 Manual Invoice actions
    case GET_MANUAL_INVOICE_DATA_REQUEST:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          manualInvoice: {
            ...state.taxxa.manualInvoice,
            loading: true,
            error: null
          }
        }
      };

    case GET_MANUAL_INVOICE_DATA_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          manualInvoice: {
            ...state.taxxa.manualInvoice,
            loading: false,
            data: action.payload,
            error: null
          }
        }
      };

    case GET_MANUAL_INVOICE_DATA_FAILURE:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          manualInvoice: {
            ...state.taxxa.manualInvoice,
            loading: false,
            error: action.payload
          }
        }
      };

    case CREATE_MANUAL_INVOICE_REQUEST:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          manualInvoice: {
            ...state.taxxa.manualInvoice,
            loading: true,
            error: null,
            success: false
          }
        }
      };

    case CREATE_MANUAL_INVOICE_SUCCESS:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          manualInvoice: {
            ...state.taxxa.manualInvoice,
            loading: false,
            data: action.payload,
            error: null,
            success: true
          },
          invoices: {
            ...state.taxxa.invoices,
            data: [...state.taxxa.invoices.data, action.payload]
          }
        }
      };

    case CREATE_MANUAL_INVOICE_FAILURE:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          manualInvoice: {
            ...state.taxxa.manualInvoice,
            loading: false,
            error: action.payload,
            success: false
          }
        }
      };

    case CLEAR_MANUAL_INVOICE_DATA:
      return {
        ...state,
        taxxa: {
          ...state.taxxa,
          manualInvoice: {
            data: null,
            items: [],
            buyer: null,
            loading: false,
            error: null,
            success: false
          }
        }
      };

    default:
      return state;
  }
};
export default rootReducer;
