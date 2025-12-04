// src/services/postService.js

import { supabase } from '../supabaseClient.js'; // Import the client

/**
 * Inserts a new blog post into the 'posts' table.
 * @param {object} postData - The blog post data including title, author_id, and content (JSONB object).
 * @returns {Promise<object | null>} The inserted post data or null on error.
 */
export async function publishPost(postData) {
  const { data, error } = await supabase
    .from('posts') 
    .insert([postData])
    .select();

  if (error) {
    console.error('Error inserting blog post:', error.message);
    // Depending on your app, you might want to throw the error
    throw new Error('Could not publish post'); 
  } else {
    console.log('Blog post created successfully:', data);
    return data[0]; // Return the first (and only) inserted object
  }
}
