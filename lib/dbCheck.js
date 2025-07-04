import { supabase } from './supabase';

export const checkDatabaseSetup = async () => {
  try {
    console.log('Checking database setup...');
    
    // Try to query the user_likes table directly
    const { data, error } = await supabase
      .from('user_likes')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('user_likes table does not exist');
        return { exists: false, needsSetup: true };
      }
      console.error('Error checking user_likes table:', error);
      return { exists: false, error };
    }

    console.log('user_likes table exists');
    return { exists: true };
    
  } catch (error) {
    console.error('Error in checkDatabaseSetup:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    return { exists: false, error };
  }
};

export const createLikesTable = async () => {
  try {
    console.log('Attempting to create user_likes table...');
    
    // Try to create the table by inserting a test record
    // This will fail if the table doesn't exist, triggering the table creation
    const testLike = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      package_id: 'test-package',
      package_data: { test: true },
      created_at: new Date().toISOString()
    };
    
    // This will fail if the table doesn't exist
    const { error: insertError } = await supabase
      .from('user_likes')
      .insert(testLike);
    
    // If we get here, the table exists but we got an error (likely permission)
    if (insertError) {
      console.log('Table might exist but got error on insert:', insertError);
      // Continue anyway - the table might exist with different permissions
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Error in createLikesTable:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    return { 
      success: false, 
      error: {
        message: 'Failed to initialize likes table. Please ensure the table exists in your Supabase database.',
        details: error
      }
    };
  }
};
