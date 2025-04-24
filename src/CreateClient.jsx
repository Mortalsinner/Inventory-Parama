import { createClient } from '@supabase/supabase-js'

const supabaseUrl = URL
const supabaseKey = API

export const supabase = createClient(supabaseUrl, supabaseKey)

export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('Barang')  // Note: lowercase 'barang'
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Connection failed:', error.message)
      return false
    }
    
    console.log('Connection successful! Data:', data)
    return true
  } catch (error) {
    console.error('Connection failed:', error.message)
    return false
  }
}