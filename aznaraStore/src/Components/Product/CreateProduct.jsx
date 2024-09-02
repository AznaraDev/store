import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, fetchCategories } from '../../Redux/Actions/actions';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CreateProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.data);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setImages([...images, ...filesArray]);
  };

  const handleRemoveImage = (indexToRemove) => {
    const filteredImages = images.filter((_, index) => index !== indexToRemove);
    setImages(filteredImages);
  };

  const handleAddSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize('');
    }
  };

  const handleAddColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !price || !stock || !categoryId || images.length === 0) {
      setAlertMessage('Por favor complete todos los campos y seleccione al menos una imagen.');
      return;
    }

    const productData = {
      name,
      description,
      price,
      stock,
      id_category: categoryId,
      images,
      sizes,
      colors,
    };

    try {
      await dispatch(createProduct(productData));

      Swal.fire({
        title: 'OK',
        text: 'Producto creado exitosamente',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
      setImages([]);
      setSizes([]);
      setColors([]);

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el producto',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div>
      <form className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Crear nuevo producto</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id_category} value={category.id_category}>
                    {category.name_category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Imágenes
              </label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
            </div>
            {images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Imágenes seleccionadas:</p>
                <div className="flex space-x-2 mt-1">
                  {images.map((image, index) => (
                    <div key={index} className="relative w-16 h-16">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Imagen ${index}`}
                        className="object-cover w-full h-full rounded-md"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center -mt-1 -mr-1 hover:bg-red-600"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">
                Talles
              </label>
              <select
                multiple
                value={sizes}
                onChange={(e) => setSizes(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Agregar nuevo talle"
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-md"
              >
                Agregar Talle
              </button>
            </div>
            <div>
              <label htmlFor="colors" className="block text-sm font-medium text-gray-700">
                Colores
              </label>
              <select
                multiple
                value={colors}
                onChange={(e) => setColors(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
              >
                <option value="Rojo">Rojo</option>
                <option value="Azul">Azul</option>
                <option value="Verde">Verde</option>
                <option value="Negro">Negro</option>
              </select>
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Agregar nuevo color"
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-md"
              >
                Agregar Color
              </button>
            </div>
          </div>
          {alertMessage && (
            <div className="mt-4 text-red-500 text-sm">{alertMessage}</div>
          )}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Subir Producto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;


