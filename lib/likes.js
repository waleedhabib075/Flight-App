import { supabase } from './supabase';

// In-memory fallback for likes when database is not available
const inMemoryLikes = new Map();

export const addLike = async (userId, packageId, packageData) => {
  try {
    // Input validation
    if (!userId) {
      const error = new Error('No user ID provided');
      console.error('Validation error:', error.message);
      return { data: null, error };
    }

    if (!packageId) {
      const error = new Error('No package ID provided');
      console.error('Validation error:', error.message);
      return { data: null, error };
    }

    console.log('Attempting to add like:', { userId, packageId });
    
    // Prepare the data to be inserted
    const likeData = {
      user_id: userId,
      package_id: packageId,
      created_at: new Date().toISOString()
    };

    // Only include package_data if it exists and is not too large
    if (packageData) {
      try {
        const packageDataStr = JSON.stringify(packageData);
        if (packageDataStr.length < 10000) { // Limit JSON size to prevent issues
          likeData.package_data = packageData;
        } else {
          console.warn('Package data too large, not including in like');
        }
      } catch (jsonError) {
        console.error('Error serializing package data:', jsonError);
      }
    }

    console.log('Attempting to save like data:', likeData);
    
    // Try to save to Supabase
    try {
      const { data, error } = await supabase
        .from('user_likes')
        .upsert(likeData, { onConflict: 'user_id,package_id' })
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        
        if (error.code === '42P01') { // Table doesn't exist
          console.warn('user_likes table does not exist. Using in-memory fallback.');
          // Fall back to in-memory storage
          const likeKey = `${userId}_${packageId}`;
          inMemoryLikes.set(likeKey, likeData);
          return { 
            data: { ...likeData, id: likeKey, isFallback: true }, 
            error: null 
          };
        }
        
        // For RLS errors, try with a simpler data structure
        if (error.code === '42501') {
          console.warn('RLS violation, trying with minimal data...');
          const { package_data, ...minimalData } = likeData;
          
          const { data: minimalInsert, error: minimalError } = await supabase
            .from('user_likes')
            .insert(minimalData)
            .select();
            
          if (!minimalError) {
            console.log('Successfully saved like with minimal data');
            return { data: minimalInsert[0], error: null };
          }
        }
        
        // If we get here, all database attempts failed - use in-memory fallback
        const likeKey = `${userId}_${packageId}`;
        inMemoryLikes.set(likeKey, likeData);
        return { 
          data: { ...likeData, id: likeKey, isFallback: true }, 
          error: null 
        };
      }

      console.log('Successfully added like to Supabase:', data);
      return { data: data[0], error: null };
      
    } catch (dbError) {
      console.error('Database operation failed, using fallback:', dbError);
      
      // Fall back to in-memory storage
      const likeKey = `${userId}_${packageId}`;
      inMemoryLikes.set(likeKey, likeData);
      
      return { 
        data: { ...likeData, id: likeKey, isFallback: true }, 
        error: null 
      };
    }
  } catch (error) {
    console.error('Unexpected error in addLike:', {
      name: error.name,
      message: error.message,
      code: error.code,
      userId,
      packageId,
      hasPackageData: !!packageData,
    });
    
    return { 
      data: null, 
      error: new Error('Failed to save like. Please check your connection.') 
    };
  }
};

export const getUserLikes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_likes')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user likes:', error);
    return { data: null, error };
  }
};

export const getLikesCount = async (userId) => {
  if (!userId) return 0;
  
  try {
    // Try to get count from Supabase
    const { count, error } = await supabase
      .from('user_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error && error.code !== '42P01') { // Ignore table doesn't exist error
      console.error('Error getting likes count:', error);
    }
    
    // Get count from in-memory fallback
    const inMemoryCount = Array.from(inMemoryLikes.values())
      .filter(like => like.user_id === userId).length;
    
    // Return the higher of the two counts
    const supabaseCount = (count || 0);
    return Math.max(supabaseCount, inMemoryCount);
      
  } catch (error) {
    console.error('Error getting likes count, using fallback:', error);
    // Return count from in-memory fallback
    return Array.from(inMemoryLikes.values())
      .filter(like => like.user_id === userId).length;
  }
};
