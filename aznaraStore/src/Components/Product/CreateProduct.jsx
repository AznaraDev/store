import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, fetchCategories, fetchSB } from "../../Redux/Actions/actions";
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
  const [sizes, setSizes] = useState(""); // Cambiado de arreglo a cadena
  const [color, setColor] = useState(""); // UN SOLO COLOR por producto
  const [materials, setMaterials] = useState(""); // Cambiado de arreglo a cadena
  const [isOffer, setIsOffer] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showVariantInfo, setShowVariantInfo] = useState(true);

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
      !color ||
      images.length === 0
    ) {
      setAlertMessage("Por favor complete todos los campos requeridos y seleccione al menos una imagen.");
      return;
    }

    // Validar que solo haya un color
    const colorTrimmed = color.trim();
    if (colorTrimmed.includes(",")) {
      setAlertMessage("⚠️ Solo puedes ingresar UN color por producto. Para otros colores, crea productos separados.");
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
      sizes: sizes ? sizes.split(",").map(size => size.trim()).filter(s => s) : [], // Convertir cadena en arreglo
      colors: [colorTrimmed], // UN SOLO COLOR como arreglo
      materials: materials ? materials.split(",").map(material => material.trim()).filter(m => m) : [], // Convertir cadena en arreglo
      isOffer,
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
      setSizes(""); // Limpiar campo de talles
      setColor(""); // Limpiar campo de color
      setMaterials(""); // Limpiar campo de materiales
      setSection("");
      setIsOffer(false);

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
      <form className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Banner informativo */}
        {showVariantInfo && (
          <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-600 text-blue-800 p-5 rounded-lg shadow-md relative">
            <button
              onClick={() => setShowVariantInfo(false)}
              className="absolute top-2 right-2 text-blue-600 hover:text-blue-900 font-bold text-xl"
            >
              ✕
            </button>
            <p className="font-bold text-lg mb-3 flex items-center">
              <span className="text-2xl mr-2">🎨</span>
              Regla de Oro: UN COLOR = UN PRODUCTO
            </p>
            <div className="bg-white/60 p-3 rounded-md mb-3">
              <p className="text-sm font-semibold mb-2">
                ✅ Para que las variantes funcionen correctamente:
              </p>
              <ul className="text-sm list-none space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">1.</span>
                  <span><strong>Ingresa SOLO UN color</strong> en el campo "Color"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">2.</span>
                  <span>Usa el <strong>mismo nombre y subcategoría</strong> para todas las variantes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">3.</span>
                  <span>Sube <strong>imágenes específicas</strong> de ese color</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">4.</span>
                  <span>Puedes tener <strong>múltiples talles y materiales</strong> (separados por coma)</span>
                </li>
              </ul>
            </div>
            <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-md">
              <p className="text-sm font-semibold mb-1">📋 Ejemplo: "Anillo Solitario"</p>
              <div className="text-xs space-y-1 ml-2">
                <p>• Producto 1: Color = <strong>"Oro Amarillo"</strong>, Materiales = "Enchapado, Macizo"</p>
                <p>• Producto 2: Color = <strong>"Oro Blanco"</strong>, Materiales = "Enchapado, Macizo"</p>
                <p>• Producto 3: Color = <strong>"Plata"</strong>, Materiales = "Enchapado, Macizo"</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold font-nunito bg-yellow-600 p-4 rounded mb-4 text-center text-gray-600">
            Crear nuevo producto
          </h2>
          <div className="border-b border-gray-200 pb-6"></div>
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
            <label htmlFor="section" className="block text-sm font-medium text-gray-700">
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
        </div>

        <div className="space-y-6">
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
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id_category} value={category.id_category}>
                    {category.name_category}
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
            <label htmlFor="sbId" className="block text-sm font-medium text-gray-700">
              Subcategoría
            </label>
            <select
              value={sbId}
              onChange={(e) => setSbId(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 mb-4"
            >
              <option value="">Seleccionar subcategoría</option>
              { 
  subCategories && subCategories.length > 0 
  ? subCategories.map((sb) => (
      sb && sb.id_SB ? (
        <option key={sb.id_SB} value={sb.id_SB}>
          {sb.name_SB}
        </option>
      ) : null
    ))
  : <option disabled value="">No hay subcategorías disponibles</option>
}

              
            </select>
          </div>

          <div>
            <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">
              Talles <span className="text-gray-400 text-xs">(opcional, separados por coma)</span>
            </label>
            <input
              type="text"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="ej: S, M, L, XL"
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1">💡 Puedes agregar múltiples talles para este color</p>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color * <span className="text-red-500 text-xs">(Solo UN color)</span>
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => {
                const value = e.target.value;
                setColor(value);
                // Advertir si detectamos coma
                if (value.includes(",")) {
                  setAlertMessage("⚠️ Solo un color por producto. Para otros colores, crea productos separados.");
                } else if (alertMessage.includes("color")) {
                  setAlertMessage("");
                }
              }}
              placeholder="ej: Oro Amarillo"
              className={`mt-1 block w-full bg-gray-100 border rounded-md py-2 px-3 text-sm ${
                color.includes(",") ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            {color.includes(",") && (
              <p className="text-red-500 text-xs mt-1">❌ Elimina las comas. Ingresa solo un color.</p>
            )}
          </div>

          <div>
            <label htmlFor="materials" className="block text-sm font-medium text-gray-700">
              Materiales <span className="text-gray-400 text-xs">(opcional, separados por coma)</span>
            </label>
            <input
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="ej: Enchapado, Macizo, Acero"
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1">💡 Especifica los materiales disponibles para este color</p>
          </div>

          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isOffer}
                onChange={() => setIsOffer(!isOffer)}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Oferta</span>
            </label>
          </div>
          {alertMessage && (
            <div className="text-red-600 text-center mt-4">
              {alertMessage}
            </div>
          )}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
            >
              Crear Producto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;

