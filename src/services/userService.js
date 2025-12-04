// src/services/userService.js

import { supabase } from '../supabaseClient'; 

/**
 * Function to update a user's role in the profiles table.
 * This function can only be called successfully by a user who is an 'admin' or 'editor' 
 * because of our RLS policy.
 * 
 * @param {string} userId - The UUID of the user whose role is being changed.
 * @param {string} newRole - The new role (e.g., 'reader', 'author', 'editor').
 */
export async function updateUserRole(userId, newRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole }) // The data we are changing
    .eq('id', userId)          // The user we are targeting
    .select();

  if (error) {
    console.error('Error updating user role:', error.message);
    throw new Error('Failed to update user role due to RLS or network error.');
  } else {
    console.log(`User ${userId} role updated to ${newRole}:`, data);
    return data;
  }
}

/**
 * Function to fetch all profiles, necessary for the admin UI list.
 */
export async function fetchAllProfiles() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*'); // Select all columns

    if (error) {
        console.error('Error fetching profiles:', error.message);
        throw new Error('Failed to fetch user profiles.');
    }
    return data;
}
