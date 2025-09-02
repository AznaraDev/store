import React, { useState } from 'react';
import { useInvoiceFlow } from '../../Redux/hooks/useTaxxa';

const TaxxaTestComponent = () => {
  const {
    // State
    buyer,
    bills,
    invoices,
    loading,
    error,
    message,
    
    // Actions
    generateBill,
    fetchBuyerByDocument,
    processComplete,
    
    // Helpers
    hasBuyer,
    hasCurrentBill,
    isProcessing
  } = useInvoiceFlow();

  const [orderDetailId, setOrderDetailId] = useState('');
  const [document, setDocument] = useState('');
  const [result, setResult] = useState(null);

  const handleGenerateBill = async () => {
    if (!orderDetailId) {
      alert('Por favor ingresa un ID de OrderDetail');
      return;
    }

    try {
      const bill = await generateBill(orderDetailId);
      console.log('✅ Bill generada:', bill);
      setResult({ type: 'bill', data: bill });
    } catch (error) {
      console.error('❌ Error generando bill:', error);
      setResult({ type: 'error', data: error.message });
    }
  };

  const handleFetchBuyer = async () => {
    if (!document) {
      alert('Por favor ingresa un documento');
      return;
    }

    try {
      const buyerData = await fetchBuyerByDocument(document);
      console.log('✅ Buyer encontrado:', buyerData);
      setResult({ type: 'buyer', data: buyerData });
    } catch (error) {
      console.error('❌ Error obteniendo buyer:', error);
      setResult({ type: 'error', data: error.message });
    }
  };

  const handleProcessComplete = async () => {
    if (!orderDetailId) {
      alert('Por favor ingresa un ID de OrderDetail');
      return;
    }

    try {
      const result = await processComplete(orderDetailId, false);
      console.log('✅ Proceso completo:', result);
      setResult({ type: 'complete', data: result });
    } catch (error) {
      console.error('❌ Error en proceso completo:', error);
      setResult({ type: 'error', data: error.message });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🏦 Panel de Pruebas Taxxa</h1>
      
      {/* Estado General */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">📊 Estado Actual</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Loading:</span>
            <span className={`ml-2 ${isProcessing ? 'text-yellow-600' : 'text-green-600'}`}>
              {isProcessing ? 'Sí' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Buyer:</span>
            <span className={`ml-2 ${hasBuyer ? 'text-green-600' : 'text-gray-600'}`}>
              {hasBuyer ? '✅' : '❌'}
            </span>
          </div>
          <div>
            <span className="font-medium">Bill:</span>
            <span className={`ml-2 ${hasCurrentBill ? 'text-green-600' : 'text-gray-600'}`}>
              {hasCurrentBill ? '✅' : '❌'}
            </span>
          </div>
          <div>
            <span className="font-medium">Bills:</span>
            <span className="ml-2 text-blue-600">{bills.data.length}</span>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {message && (
          <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">
            <strong>Mensaje:</strong> {message}
          </div>
        )}
      </div>

      {/* Controles de Prueba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Generar Bill */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">📋 Generar Bill</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Order Detail ID"
              value={orderDetailId}
              onChange={(e) => setOrderDetailId(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleGenerateBill}
              disabled={isProcessing}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isProcessing ? 'Generando...' : 'Generar Bill'}
            </button>
          </div>
        </div>

        {/* Buscar Buyer */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">👤 Buscar Buyer</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Documento (ej: 1127578894)"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleFetchBuyer}
              disabled={isProcessing}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isProcessing ? 'Buscando...' : 'Buscar Buyer'}
            </button>
          </div>
        </div>

        {/* Proceso Completo */}
        <div className="bg-white border rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">🚀 Proceso Completo</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Esto ejecutará todo el flujo: OrderDetail → Bill → Buyer → Invoice
            </p>
            <button
              onClick={handleProcessComplete}
              disabled={isProcessing || !orderDetailId}
              className="w-full bg-purple-500 text-white p-3 rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {isProcessing ? 'Procesando...' : 'Ejecutar Proceso Completo'}
            </button>
          </div>
        </div>
      </div>

      {/* Resultado de la Última Acción */}
      {result && (
        <div className="mt-6 bg-gray-50 border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">📄 Último Resultado</h3>
          <div className="bg-white p-3 rounded border">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Tipo:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                result.type === 'error' ? 'bg-red-100 text-red-700' :
                result.type === 'complete' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {result.type}
              </span>
            </div>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Estado Detallado */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">🔍 Estado Detallado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Buyer State */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium mb-2">👤 Buyer</h4>
            <div className="text-xs space-y-1">
              <div>Loading: {buyer.loading ? '✅' : '❌'}</div>
              <div>Data: {buyer.data ? '✅' : '❌'}</div>
              <div>Error: {buyer.error ? '❌' : '✅'}</div>
              {buyer.data && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <div>Doc: {buyer.data.document}</div>
                  <div>Name: {buyer.data.name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Bills State */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium mb-2">📋 Bills</h4>
            <div className="text-xs space-y-1">
              <div>Loading: {bills.loading ? '✅' : '❌'}</div>
              <div>Count: {bills.data.length}</div>
              <div>Current: {bills.currentBill ? '✅' : '❌'}</div>
              <div>Error: {bills.error ? '❌' : '✅'}</div>
              {bills.currentBill && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <div>ID: {bills.currentBill.id}</div>
                  <div>Total: ${bills.currentBill.total}</div>
                </div>
              )}
            </div>
          </div>

          {/* Invoices State */}
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium mb-2">🧾 Invoices</h4>
            <div className="text-xs space-y-1">
              <div>Loading: {invoices.loading ? '✅' : '❌'}</div>
              <div>Count: {invoices.data.length}</div>
              <div>Current: {invoices.currentInvoice ? '✅' : '❌'}</div>
              <div>Error: {invoices.error ? '❌' : '✅'}</div>
              {invoices.currentInvoice && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <div>ID: {invoices.currentInvoice.id}</div>
                  <div>Status: {invoices.currentInvoice.status}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxxaTestComponent;
