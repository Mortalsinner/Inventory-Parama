import { supabase } from '../CreateClient';
import { useNavigate } from 'react-router-dom';

const DeleteBarang = async (id, navigate) => {
    try {
        // First, get the item to check if it has an image
        const { data: item, error: fetchError } = await supabase
            .from('Barang')
            .select('fotoBarang')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // If there's an image, delete it from storage
        if (item?.fotoBarang) {
            const fileName = item.fotoBarang.split('/').pop();
            const { error: storageError } = await supabase.storage
                .from('fotobarang')
                .remove([fileName]);

            if (storageError) {
                console.error('Error deleting image:', storageError);
            }
        }

        // Delete the item from the database
        const { error: deleteError } = await supabase
            .from('Barang')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        alert('Data berhasil dihapus!');
        navigate('/');
        return true;
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Gagal menghapus data: ' + error.message);
        navigate('/');
        return false;
    }
};

export default DeleteBarang;