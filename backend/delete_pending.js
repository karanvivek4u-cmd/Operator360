require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deletePending() {
  const { data, error } = await supabase
    .from('service_requests')
    .delete()
    .eq('overall_status', 'PENDING');
    
  if (error) {
    console.error('Error deleting pending requests:', error);
  } else {
    console.log('Successfully deleted all pending service requests.');
  }
}

deletePending();
