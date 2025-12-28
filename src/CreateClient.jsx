import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mckmtrudipsdijiontgd.supabase.co'
const supabaseKey = 'sb_publishable_l9ENlULd5pGHe66RDfoFsg_CPGExU8R'

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

    console.log('Connection successful!')
    return true
  } catch (error) {
    console.error('Connection failed:', error.message)
    return false
  }
}