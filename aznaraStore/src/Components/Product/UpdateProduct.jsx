import  { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, updateProduct, fetchCategories, fetchSB } from '../../Redux/Actions/actions'; 
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const UpdateProduct = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const product = useSelector((state) => state.product);
    const categories = useSelector((state) => state.categories.data);
    const subCategories = useSelector((state) => state.subCategories.data); 

    const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      section: '',
      name_SB: '',
      sizes: '',   
      colors: '',
      materials: [],
      isOffer: false,
      id_category: '', 
      id_SB: '', 
      
    });

    const [existingImages, setExistingImages] = useState([]); 
    const [newImageFiles, setNewImageFiles] = useState([]); 
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [availableMaterials, setAvailableMaterials] = useState([]);


    useEffect(() => {
      dispatch(fetchCategories());
      dispatch(fetchSB());
    }, [dispatch]);

    useEffect(() => {
      const fetchMaterials = async () => {
        try {
          const BASE_URL = import.meta.env.VITE_BASE_URL;
          console.log('🔍 Fetching materials from:', `${BASE_URL}/material?limit=100`);
          const response = await axios.get(`${BASE_URL}/material?limit=100`);
          console.log('📦 Materials response:', response.data);
          if (response.data?.data?.materials && Array.isArray(response.data.data.materials)) {
            console.log('✅ Setting materials:', response.data.data.materials);
            setAvailableMaterials(response.data.data.materials);
          } else {
            console.log('⚠️ Materials not found in expected structure:', response.data);
          }
        } catch (error) {
          console.error('❌ Error fetching materials:', error);
        }
      };
      fetchMaterials();
    }, []);

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
          // Convertir arrays a strings separados por comas para edición
          sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
          colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
          materials: Array.isArray(product.materials) ? product.materials : (product.materials ? product.materials.split(',').map(m => m.trim()) : []),
          isOffer: product.isOffer || false,
          id_category: product.id_category || '', 
          id_SB: product.id_SB || '',     
        });
       
        setExistingImages(product.Images || []);
      }
    }, [product]);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      
      // Validar color único
      if (name === 'colors' && value.includes(',')) {
        setAlertMessage('⚠️ Solo puedes ingresar UN color por producto. Para otros colores, edita o crea productos separados.');
      } else if (name === 'colors' && alertMessage.includes('color')) {
        setAlertMessage('');
      }

      // Manejar selección múltiple de materiales
      if (name === 'materials') {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData((prevState) => ({
          ...prevState,
          materials: selectedOptions,
        }));
      } else {
        setFormData((prevState) => ({
          ...prevState,
          [name]: type === 'checkbox' ? checked : value,
        }));
      }
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
      dataToSend.append('id_category', formData.id_category);
      dataToSend.append('id_SB', formData.id_SB);

     
  const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
  const colorsArray = formData.colors.split(',').map(c => c.trim()).filter(Boolean);
  const materialsArray = Array.isArray(formData.materials) ? formData.materials : [];

  dataToSend.append('sizes', JSON.stringify(sizesArray));
  dataToSend.append('colors', JSON.stringify(colorsArray));
  dataToSend.append('materials', JSON.stringify(materialsArray));


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
            
            {/* Banner informativo */}
            <div className="mb-6 bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-600 text-blue-800 p-4 rounded-lg">
              <p className="font-bold text-sm mb-2 flex items-center">
                <span className="text-xl mr-2">🎨</span>
                Recuerda: UN COLOR = UN PRODUCTO
              </p>
              <p className="text-xs">
                Para crear variantes de color, debes crear productos separados con el mismo nombre y subcategoría.
              </p>
            </div>

            {/* Mensaje de alerta */}
            {alertMessage && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                <p className="text-sm">{alertMessage}</p>
              </div>
            )}
            
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
               <div>
                <label htmlFor="id_category" className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  name="id_category"
                  id="id_category"
                  value={formData.id_category}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id_category} value={category.id_category}>
                        {category.name_category}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">No hay categorías disponibles</option>
                  )}
                </select>
              </div>

              {/* NUEVO: Select de Subcategoría */}
              <div>
                <label htmlFor="id_SB" className="block text-sm font-medium text-gray-700">Subcategoría</label>
                <select
                  name="id_SB"
                  id="id_SB"
                  value={formData.id_SB}
                  onChange={handleChange}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
                >
                  <option value="">Seleccionar subcategoría</option>
                  {subCategories && subCategories.length > 0 ? (
                    subCategories.map((sb) => (
                      sb && sb.id_SB ? (
                        <option key={sb.id_SB} value={sb.id_SB}>
                          {sb.name_SB}
                        </option>
                      ) : null
                    ))
                  ) : (
                    <option disabled value="">No hay subcategorías disponibles</option>
                  )}
                </select>
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
                <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">
                  Talles <span className="text-gray-400 text-xs">(opcional, separados por coma)</span>
                </label>
                <input 
                  type="text" 
                  name="sizes" 
                  id="sizes" 
                  value={formData.sizes} 
                  onChange={handleChange} 
                  placeholder='ej: S, M, L, XL' 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" 
                />
                <p className="text-gray-500 text-xs mt-1">💡 Puedes agregar múltiples talles para este color</p>
              </div>
              <div>
                <label htmlFor="colors" className="block text-sm font-medium text-gray-700">
                  Color * <span className="text-red-500 text-xs">(Solo UN color)</span>
                </label>
                <input 
                  type="text" 
                  name="colors" 
                  id="colors" 
                  value={formData.colors} 
                  onChange={handleChange} 
                  placeholder='ej: Oro Amarillo' 
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    formData.colors.includes(',') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'
                  }`}
                  required
                />
                {formData.colors.includes(',') && (
                  <p className="text-red-500 text-xs mt-1">❌ Elimina las comas. Ingresa solo un color.</p>
                )}
              </div>
              <div>
                <label htmlFor="materials" className="block text-sm font-medium text-gray-700">
                  Materiales <span className="text-gray-400 text-xs">(opcional, puedes seleccionar varios)</span>
                </label>
                <select 
                  multiple
                  name="materials" 
                  id="materials" 
                  value={formData.materials} 
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                  style={{ minHeight: '120px' }}
                >
                  {availableMaterials.map((material) => (
                    <option key={material.id_material} value={material.name}>
                      {material.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs mt-1">💡 Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios materiales</p>
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