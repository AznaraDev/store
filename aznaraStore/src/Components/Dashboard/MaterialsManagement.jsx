import { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import DashboardLayout from '../Dashboard/DashboardLayout';

const BASE_URL = import.meta.env.VITE_URL_DEPLOY;

function MaterialsManagement() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const userInfo = useSelector((state) => state.userInfo);

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/material`, {
        params: { search: searchTerm, limit: 100 }
      });
      setMaterials(response.data.materials || []);
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      Swal.fire('Error', 'No se pudieron cargar los materiales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        description: material.description || ''
      });
    } else {
      setEditingMaterial(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMaterial(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire('Error', 'El nombre del material es obligatorio', 'error');
      return;
    }

    try {
      if (editingMaterial) {
        // Actualizar
        await axios.put(
          `${BASE_URL}/material/${editingMaterial.id_material}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`
            }
          }
        );
        Swal.fire('¡Éxito!', 'Material actualizado correctamente', 'success');
      } else {
        // Crear
        await axios.post(`${BASE_URL}/material`, formData, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        });
        Swal.fire('¡Éxito!', 'Material creado correctamente', 'success');
      }
      handleCloseModal();
      fetchMaterials();
    } catch (error) {
      console.error('Error al guardar material:', error);
      const message = error.response?.data?.error || 'Error al guardar el material';
      Swal.fire('Error', message, 'error');
    }
  };

  const handleDelete = async (materialId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el material',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/material/${materialId}`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        });
        Swal.fire('¡Eliminado!', 'Material eliminado correctamente', 'success');
        fetchMaterials();
      } catch (error) {
        console.error('Error al eliminar material:', error);
        Swal.fire('Error', 'No se pudo eliminar el material', 'error');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Materiales</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Nuevo Material
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando materiales...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No hay materiales registrados
                    </td>
                  </tr>
                ) : (
                  materials.map((material) => (
                    <tr key={material.id_material}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {material.name}
                      </td>
                      <td className="px-6 py-4">
                        {material.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenModal(material)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(material.id_material)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingMaterial ? 'Editar Material' : 'Nuevo Material'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingMaterial ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MaterialsManagement;
