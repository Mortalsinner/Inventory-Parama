import { supabase } from '../CreateClient';

const DeleteBarang = async (id) => {
  try {
    // Ambil path gambar
    const { data: item, error: fetchError } = await supabase
      .from('Barang')
      .select('fotoBarang')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Hapus gambar dari storage jika ada
    if (item?.fotoBarang) {
      const { error: storageError } = await supabase.storage
        .from('fotobarang')
        .remove([item.fotoBarang]); // gunakan path lengkap, jangan hanya nama file

      if (storageError) {
        console.warn('Gagal hapus gambar:', storageError.message);
      }
    }

    // Hapus data dari tabel
    const { error: deleteError } = await supabase
      .from('Barang')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Error saat menghapus:', error.message);
    return false;
  }
};

export default DeleteBarang;
