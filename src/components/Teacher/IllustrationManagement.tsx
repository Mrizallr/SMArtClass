import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Image, Upload, Link, X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Illustration {
  id: string;
  text_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  text_title?: string;
}

interface IllustrationFormData {
  textId: string;
  imageUrl: string;
  caption: string;
}

export const IllustrationManagement: React.FC = () => {
  const { texts } = useDataStore();
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIllustration, setEditingIllustration] = useState<Illustration | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<IllustrationFormData>({
    textId: '',
    imageUrl: '',
    caption: ''
  });

  useEffect(() => {
    fetchIllustrations();
  }, []);

  const fetchIllustrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('illustrations')
        .select(`
          *,
          texts(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const illustrationsWithTextTitle = data?.map(ill => ({
        ...ill,
        text_title: ill.texts?.title || 'Teks tidak ditemukan'
      })) || [];

      setIllustrations(illustrationsWithTextTitle);
    } catch (error) {
      console.error('Error fetching illustrations:', error);
      toast.error('Gagal memuat ilustrasi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.textId || !formData.imageUrl) {
      toast.error('Teks dan URL gambar wajib diisi');
      return;
    }

    try {
      if (editingIllustration) {
        const { error } = await supabase
          .from('illustrations')
          .update({
            text_id: formData.textId,
            image_url: formData.imageUrl,
            caption: formData.caption || null
          })
          .eq('id', editingIllustration.id);

        if (error) throw error;
        toast.success('Ilustrasi berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('illustrations')
          .insert([{
            text_id: formData.textId,
            image_url: formData.imageUrl,
            caption: formData.caption || null
          }]);

        if (error) throw error;
        toast.success('Ilustrasi berhasil ditambahkan!');
      }

      setShowForm(false);
      setEditingIllustration(null);
      setFormData({ textId: '', imageUrl: '', caption: '' });
      fetchIllustrations();
    } catch (error) {
      console.error('Error saving illustration:', error);
      toast.error('Gagal menyimpan ilustrasi');
    }
  };

  const handleEdit = (illustration: Illustration) => {
    setEditingIllustration(illustration);
    setFormData({
      textId: illustration.text_id,
      imageUrl: illustration.image_url,
      caption: illustration.caption || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ilustrasi ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('illustrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Ilustrasi berhasil dihapus!');
      fetchIllustrations();
    } catch (error) {
      console.error('Error deleting illustration:', error);
      toast.error('Gagal menghapus ilustrasi');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIllustration(null);
    setFormData({ textId: '', imageUrl: '', caption: '' });
  };

  const filteredIllustrations = illustrations.filter(illustration => {
    const matchesText = selectedText === 'all' || illustration.text_id === selectedText;
    const matchesSearch = 
      illustration.text_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      illustration.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      illustration.image_url.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesText && matchesSearch;
  });

  const suggestedImages = [
    {
      url: 'https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Timun/Mentimun'
    },
    {
      url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Media Sosial'
    },
    {
      url: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Candi/Arsitektur'
    },
    {
      url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Makanan/Masakan'
    },
    {
      url: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Lingkungan/Alam'
    },
    {
      url: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=800',
      caption: 'Buku/Pendidikan'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Ilustrasi</h1>
          <p className="text-gray-600">Tambah, edit, dan kelola ilustrasi untuk teks bacaan</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Ilustrasi</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari ilustrasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Teks</option>
              {texts.map(text => (
                <option key={text.id} value={text.id}>{text.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ilustrasi</p>
              <p className="text-2xl font-bold text-gray-900">{illustrations.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Teks dengan Ilustrasi</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(illustrations.map(i => i.text_id)).size}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hasil Filter</p>
              <p className="text-2xl font-bold text-gray-900">{filteredIllustrations.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Illustrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIllustrations.map((illustration) => (
          <div
            key={illustration.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={illustration.image_url}
                alt={illustration.caption || 'Ilustrasi'}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setPreviewImage(illustration.image_url)}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => handleEdit(illustration)}
                  className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(illustration.id)}
                  className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                {illustration.text_title}
              </h3>
              {illustration.caption && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {illustration.caption}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {new Date(illustration.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredIllustrations.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada ilustrasi ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Ilustrasi Pertama</span>
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingIllustration ? 'Edit Ilustrasi' : 'Tambah Ilustrasi Baru'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Teks *
                </label>
                <select
                  value={formData.textId}
                  onChange={(e) => setFormData({ ...formData, textId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih teks...</option>
                  {texts.map(text => (
                    <option key={text.id} value={text.id}>{text.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Gambar *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(formData.imageUrl)}
                    disabled={!formData.imageUrl}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Masukkan URL gambar dari Pexels atau sumber lainnya
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption/Deskripsi
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi singkat tentang gambar..."
                />
              </div>

              {/* Suggested Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gambar Saran dari Pexels
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {suggestedImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative cursor-pointer group"
                      onClick={() => setFormData({ ...formData, imageUrl: image.url })}
                    >
                      <img
                        src={image.url}
                        alt={image.caption}
                        className="w-full h-20 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                        <Link className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">{image.caption}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingIllustration ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};