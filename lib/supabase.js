import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dabpvslxkazruqccmtxs.supabase.co'
const supabaseKey = 'sb_publishable_6D673b_CXgypnSFmrNozVA_S_tnPXFS'

export const supabase = createClient(supabaseUrl, supabaseKey)