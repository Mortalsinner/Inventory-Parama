import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://divoxhmfbnnzteotrpgk.supabase.co/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdm94aG1mYm5uenRlb3RycGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MTE2MjksImV4cCI6MjA2MDE4NzYyOX0.E-D7SzhzDNZTeUe7DlVveh7mOOgSX_TxwVPsnkCYb-Q'

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