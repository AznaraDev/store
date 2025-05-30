import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, updateProduct } from '../../Redux/Actions/actions'; 
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const UpdateProduct = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const product = useSelector((state) => state.product); 

    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      section: '',
      name_SB: '',
      sizes: '',   
      colors: '',
      materials: '',
      isOffer: false, 
      
    });

    const [existingImages, setExistingImages] = useState([]); 
    const [newImageFiles, setNewImageFiles] = useState([]); 
    const [imagesToDelete, setImagesToDelete] = useState([]); 

    useEffect(() => {
      if (id) {
        dispatch(fetchProductById(id));
      }
    }, [dispatch, id]);

    useEffect(() => {
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          stock: product.stock || 0,
          section: product.section || '',
          name_SB: product.name_SB || '',
          // Para sizes, colors, materials, si son JSON strings en el backend y quieres editarlos como texto:
          sizes: typeof product.sizes === 'object' ? JSON.stringify(product.sizes) : product.sizes || '',
          colors: typeof product.colors === 'object' ? JSON.stringify(product.colors) : product.colors || '',
          materials: typeof product.materials === 'object' ? JSON.stringify(product.materials) : product.materials || '',
          isOffer: product.isOffer || false,
        });
       
        setExistingImages(product.Images || []);
      }
    }, [product]);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prevState) => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };

    const handleNewImageChange = (e) => {
      setNewImageFiles(Array.from(e.target.files)); 
    };

    const toggleImageForDeletion = (imageId) => {
      setImagesToDelete((prev) =>
        prev.includes(imageId)
          ? prev.filter((id) => id !== imageId)
          : [...prev, imageId]
      );
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('description', formData.description);
      dataToSend.append('price', formData.price);
      dataToSend.append('stock', formData.stock);
      dataToSend.append('section', formData.section);
      dataToSend.append('name_SB', formData.name_SB);
      dataToSend.append('isOffer', formData.isOffer);

     
      dataToSend.append('sizes', formData.sizes); 
      dataToSend.append('colors', formData.colors);
      dataToSend.append('materials', formData.materials);


      // Añadir nuevas imágenes
      newImageFiles.forEach((file) => {
        dataToSend.append('newImages', file);
      });

      // Añadir IDs de imágenes a eliminar
      if (imagesToDelete.length > 0) {
        dataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      
   
      try {
        await dispatch(updateProduct(id, dataToSend)); 
        Swal.fire({
          title: 'Modificado',
          text: 'Producto modificado exitosamente',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/products'); // O a la página de detalles del producto
        });
      } catch (error) {
        console.error("Error updating product:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo modificar el producto. ' + (error.message || ''),
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };

    return (
      <div className="min-h-screen pt-16 pb-16 bg-colorFooter">
        <div className="container mx-auto px-4 py-8 rounded-lg shadow-md">
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg mt-10 mb-10">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Actualizar Producto</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos existentes del formulario */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="description"
                  id="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
                  <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                  <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700">Sección</label>
                <input type="text" name="section" id="section" value={formData.section} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="name_SB" className="block text-sm font-medium text-gray-700">Nombre Subcategoría</label>
                <input type="text" name="name_SB" id="name_SB" value={formData.name_SB} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">Talles (JSON string)</label>
                <input type="text" name="sizes" id="sizes" value={formData.sizes} onChange={handleChange} placeholder='Ej: ["S", "M"] o {"S": 10, "M": 5}' className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="colors" className="block text-sm font-medium text-gray-700">Colores (JSON string)</label>
                <input type="text" name="colors" id="colors" value={formData.colors} onChange={handleChange} placeholder='Ej: ["Rojo", "Azul"] o {"Rojo": true}' className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="materials" className="block text-sm font-medium text-gray-700">Materiales (JSON string)</label>
                <input type="text" name="materials" id="materials" value={formData.materials} onChange={handleChange} placeholder='Ej: ["Algodón", "Poliéster"]' className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
              </div>
               <div className="flex items-center">
                <input
                  id="isOffer"
                  name="isOffer"
                  type="checkbox"
                  checked={formData.isOffer}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="isOffer" className="ml-2 block text-sm text-gray-900">
                  ¿Es oferta?
                </label>
              </div>


              {/* Sección para Imágenes Existentes */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Imágenes Actuales</h3>
                {existingImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingImages.map((image) => (
                      <div key={image.id_image} className="relative group">
                        <img
                          src={image.url}
                          alt={`Producto ${formData.name} - Imagen ${image.id_image}`}
                          className="w-full h-32 object-cover rounded-md shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => toggleImageForDeletion(image.id_image)}
                          className={`absolute top-1 right-1 p-1 rounded-full text-xs font-semibold
                                      ${imagesToDelete.includes(image.id_image)
                                        ? 'bg-red-500 text-white hover:bg-red-700'
                                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                      }`}
                          title={imagesToDelete.includes(image.id_image) ? "Cancelar eliminación" : "Marcar para eliminar"}
                        >
                          {imagesToDelete.includes(image.id_image) ? 'Cancelar' : 'Eliminar'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay imágenes existentes.</p>
                )}
              </div>

              {/* Sección para Añadir Nuevas Imágenes */}
              <div className="mt-6">
                <label htmlFor="newImages" className="block text-sm font-medium text-gray-700">
                  Añadir Nuevas Imágenes (Max. 5)
                </label>
                <input
                  type="file"
                  name="newImages"
                  id="newImages"
                  multiple // Permite seleccionar múltiples archivos
                  accept="image/*" // Acepta solo archivos de imagen
                  onChange={handleNewImageChange}
                  className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-yellow-50 file:text-yellow-700
                            hover:file:bg-yellow-100"
                />
                {/* Previsualización de nuevas imágenes (opcional pero útil) */}
                {newImageFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {newImageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Nueva imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md shadow-md"
                          onLoad={() => URL.revokeObjectURL(file)} // Limpiar object URL después de cargar
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-5">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Actualizar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
};

export default UpdateProduct;