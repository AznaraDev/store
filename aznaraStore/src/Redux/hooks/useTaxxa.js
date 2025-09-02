import { useSelector, useDispatch } from 'react-redux';
import * as taxxaActions from '../Actions/taxxaActions';

// Hook personalizado para manejar el estado de Taxxa
export const useTaxxa = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const taxxaState = useSelector(state => state.taxxa);
  
  // Destructured state
  const {
    buyer,
    seller,
    bills,
    invoices,
    processing,
    loading,
    error,
    message
  } = taxxaState;

  // Actions dispatchers
  const actions = {
    // Buyer actions
    fetchBuyerByDocument: (document) => dispatch(taxxaActions.fetchBuyerByDocument(document)),
    createBuyer: (buyerData) => dispatch(taxxaActions.createBuyer(buyerData)),
    checkOrCreateBuyer: (document) => dispatch(taxxaActions.checkOrCreateBuyer(document)),
    
    // Seller actions
    fetchSellerByDocument: (document) => dispatch(taxxaActions.fetchSellerByDocument(document)),
    createSeller: (sellerData) => dispatch(taxxaActions.createSeller(sellerData)),
    updateSeller: (document, sellerData) => dispatch(taxxaActions.updateSeller(document, sellerData)),
    
    // Bill actions
    generateBill: (orderDetailId) => dispatch(taxxaActions.generateBill(orderDetailId)),
    fetchAllBills: (page, limit) => dispatch(taxxaActions.fetchAllBills(page, limit)),
    fetchBillById: (billId) => dispatch(taxxaActions.fetchBillById(billId)),
    
    // Invoice actions
    sendInvoiceFromBill: (billId, contingency) => dispatch(taxxaActions.sendInvoiceFromBill(billId, contingency)),
    fetchAllInvoices: (page, limit) => dispatch(taxxaActions.fetchAllInvoices(page, limit)),
    fetchInvoiceById: (invoiceId) => dispatch(taxxaActions.fetchInvoiceById(invoiceId)),
    
    // Process actions
    processOrderInvoice: (orderDetailId, contingency) => dispatch(taxxaActions.processOrderInvoice(orderDetailId, contingency)),
    
    // Utility actions
    clearTaxxaState: () => dispatch(taxxaActions.clearTaxxaState()),
    setTaxxaError: (error) => dispatch(taxxaActions.setTaxxaError(error))
  };

  return {
    // State
    state: taxxaState,
    buyer,
    seller,
    bills,
    invoices,
    processing,
    loading,
    error,
    message,
    
    // Actions
    ...actions,
    
    // Computed values
    hasBuyer: !!buyer.data,
    hasSeller: !!seller.data,
    hasCurrentBill: !!bills.currentBill,
    hasCurrentInvoice: !!invoices.currentInvoice,
    isProcessing: processing.loading || loading,
    
    // Helper functions
    getBuyerDocument: () => buyer.data?.document || null,
    getSellerDocument: () => seller.data?.document || null,
    getSellerName: () => seller.data?.name || null,
    getCurrentBillId: () => bills.currentBill?.id || null,
    getCurrentInvoiceId: () => invoices.currentInvoice?.id || null,
    
    // Error helpers
    getBuyerError: () => buyer.error,
    getSellerError: () => seller.error,
    getBillsError: () => bills.error,
    getInvoicesError: () => invoices.error,
    getGeneralError: () => error
  };
};

// Hook específico para el flujo de facturación
export const useInvoiceFlow = () => {
  const taxxa = useTaxxa();
  
  const processComplete = async (orderDetailId, contingency = false) => {
    try {
      console.log('🚀 Iniciando flujo completo de facturación...');
      
      const result = await taxxa.processOrderInvoice(orderDetailId, contingency);
      
      if (result.success) {
        console.log('✅ Flujo completo exitoso:', result);
        return {
          success: true,
          data: result,
          message: 'Facturación completada exitosamente'
        };
      } else {
        console.error('❌ Error en flujo:', result.error);
        return {
          success: false,
          error: result.error,
          message: result.message || 'Error en el proceso de facturación'
        };
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error inesperado en el proceso'
      };
    }
  };

  return {
    ...taxxa,
    processComplete
  };
};

// Selector específico para obtener solo el estado que necesites
export const useTaxxaSelector = (selector) => {
  return useSelector(state => selector(state.taxxa));
};

// Selectors predefinidos
export const taxxaSelectors = {
  getBuyer: (state) => state.taxxa.buyer,
  getSeller: (state) => state.taxxa.seller,
  getBills: (state) => state.taxxa.bills,
  getInvoices: (state) => state.taxxa.invoices,
  getLoading: (state) => state.taxxa.loading,
  getError: (state) => state.taxxa.error,
  getMessage: (state) => state.taxxa.message,
  
  // Computed selectors
  getIsLoading: (state) => state.taxxa.loading || state.taxxa.buyer.loading || state.taxxa.seller.loading || state.taxxa.bills.loading || state.taxxa.invoices.loading,
  getHasError: (state) => !!(state.taxxa.error || state.taxxa.buyer.error || state.taxxa.seller.error || state.taxxa.bills.error || state.taxxa.invoices.error),
  getAllErrors: (state) => [
    state.taxxa.error,
    state.taxxa.buyer.error,
    state.taxxa.seller.error,
    state.taxxa.bills.error,
    state.taxxa.invoices.error
  ].filter(Boolean)
};

export default useTaxxa;
