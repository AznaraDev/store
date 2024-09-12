import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  fetchCategories,
  fetchSB,
} from "../../Redux/Actions/actions";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CreateProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [section, setSection] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sbId, setSbId] = useState("");
  const [images, setImages] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [newSize, setNewSize] = useState("");
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [newColor, setNewColor] = useState("");
  const [isOffer, setIsOffer] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.data);
  const subCategories = useSelector((state) => state.subCategories.data);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSB());
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
      setNewSize("");
    }
  };

  const handleAddColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor("");
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial && !materials.includes(newMaterial)) {
      setMaterials([...materials, newMaterial]);
      setNewMaterial("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !section ||
      !description ||
      !price ||
      !stock ||
      !categoryId ||
      !sbId ||
      images.length === 0
    ) {
      setAlertMessage(
        "Por favor complete todos los campos y seleccione al menos una imagen."
      );
      return;
    }

    const productData = {
      name,
      description,
      price,
      stock,
      section,
      id_category: categoryId,
      id_SB: sbId,
      images,
      sizes,
      colors,
      materials,
      isOffer, // Incluye isOffer en los datos del producto
    };
    console.log(productData);
    try {
      await dispatch(createProduct(productData));

      Swal.fire({
        title: "OK",
        text: "Producto creado exitosamente",
        icon: "success",
        confirmButtonText: "OK",
      });

      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setSbId("");
      setImages([]);
      setSizes([]);
      setColors([]);
      setMaterials([]);
      setSection("");
      setIsOffer(false); // Reinicia el estado de isOffer

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al crear el producto",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="bg-colorFooter min-h-screen pt-16">
      {" "}
      {/* Asegúrate de que haya suficiente espacio para el navbar */}
      <form className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold font-nunito bg-yellow-600 p-4 rounded mb-4 text-center text-gray-600">
            Crear nuevo producto
          </h2>
          <div className="border-b border-gray-200 pb-6"></div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="section"
              className="block text-sm font-medium text-gray-700"
            >
              Sección
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
            >
              <option value="">Seleccionar sección</option>
              <option value="Dama">Dama</option>
              <option value="Caballero">Caballero</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="images"
              className="block text-sm font-medium text-gray-700"
            >
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
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700"
            >
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
            >
              <option value="">Seleccionar categoría</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option
                    key={category.id_category}
                    value={category.id_category}
                  >
                    {category.name_category}{" "}
                    {/* Mostrar el nombre de la categoría */}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No hay categorias disponibles
                </option>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="sbId"
              className="block text-sm font-medium text-gray-700"
            >
              Sub Categoría
            </label>
            <select
              value={sbId}
              onChange={(e) => setSbId(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
            >
              <option value="">Seleccionar Sub Categoría</option>
              {subCategories && subCategories.length > 0 ? (
                subCategories.map((sub) => (
                  <option key={sub.id_SB} value={sub.id_SB}>
                    {sub.name_SB}{" "}
                    {/* Asegúrate de usar el campo que tiene el nombre */}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No hay SubCategorias disponibles
                </option>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="sizes"
              className="block text-sm font-medium text-gray-700"
            >
              Talles
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
            >
              <option value="" disabled>
                Selecciona un talle
              </option>
              {sizes && sizes.length > 0 ? (
                sizes.map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No hay talles disponibles
                </option>
              )}
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
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md"
            >
              Agregar talle
            </button>
          </div>

          <div>
            <label
              htmlFor="colors"
              className="block text-sm font-medium text-gray-700"
            >
              Colores
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
            >
              <option value="" disabled>
                Selecciona un Color
              </option>
              {colors && colors.length > 0 ? (
                colors.map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No hay colores disponibles
                </option>
              )}
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
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md"
            >
              Agregar color
            </button>
          </div>

          <div>
            <label
              htmlFor="materials"
              className="block text-sm font-medium text-gray-700"
            >
              Material
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
            >
              <option value="" disabled>
                Selecciona el Material
              </option>
              {materials && materials.length > 0 ? (
                materials.map((material, index) => (
                  <option key={index} value={material}>
                    {material}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No hay talles disponibles
                </option>
              )}
            </select>
            <input
              type="text"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              placeholder="Agregar nuevo Material"
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
            />
            <button
              type="button"
              onClick={handleAddMaterial}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md"
            >
              Agregar Material
            </button>
          </div>
          <div></div>
          <div>
            <label
              htmlFor="isOffer"
              className="flex items-center font-nunito text-xl"
            >
              <input
                type="checkbox"
                checked={isOffer}
                onChange={() => setIsOffer(!isOffer)}
                className="mr-2"
              />
              <span>Oferta</span>
            </label>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="col-span-2 text-center px-4 py-2 bg-yellow-600 text-white rounded-md"
          >
            Crear Producto
          </button>
          {alertMessage && (
            <div className="col-span-2 text-red-600">{alertMessage}</div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
