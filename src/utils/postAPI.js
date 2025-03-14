import { client } from './amplifyConfig.js';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';

/**
 * Create a new post
 * @param {Object} postData - The post data
 * @returns {Promise} - The created post
 */
export const createPost = async (postData) => {
  try {
    console.log('Creating post with data:', postData);
    
    // Validate required fields
    if (!postData.title) {
      console.error('Missing required fields:', { 
        title: !!postData.title
      });
      throw new Error('Missing required fields');
    }
    
    const response = await client.graphql({
      query: mutations.createPost,
      variables: {
        title: postData.title
      },
      authMode: 'apiKey'
    });
    console.log('Create post response:', response);
    return response.data.createPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * List all posts
 * @returns {Promise} - Array of posts
 */
export const listPosts = async () => {
  try {
    console.log('Fetching posts');
    
    const response = await client.graphql({
      query: queries.listPosts,
      variables: {},
      authMode: 'apiKey'
    });
    
    console.log('List posts response:', response);
    
    // If we have errors but the request didn't throw, log them
    if (response.errors) {
      console.error('GraphQL errors:', response.errors);
      return [];
    }
    
    return response.data.listPosts.items || [];
  } catch (error) {
    console.error('Error listing posts:', error);
    // Return empty array to prevent app from crashing
    return [];
  }
};

/**
 * Get a post by ID
 * @param {string} id - The post ID
 * @returns {Promise} - The post
 */
export const getPost = async (id) => {
  try {
    console.log('Getting post with ID:', id);
    const response = await client.graphql({
      query: queries.getPost,
      variables: { id },
      authMode: 'apiKey'
    });
    console.log('Get post response:', response);
    return response.data.getPost;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

/**
 * Update a post
 * @param {Object} postData - The post data with ID
 * @returns {Promise} - The updated post
 */
export const updatePost = async (postData) => {
  try {
    console.log('Updating post with data:', postData);
    const response = await client.graphql({
      query: mutations.updatePost,
      variables: {
        id: postData.id,
        title: postData.title
      },
      authMode: 'apiKey'
    });
    console.log('Update post response:', response);
    return response.data.updatePost;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} id - The post ID
 * @returns {Promise} - The deleted post
 */
export const deletePost = async (id) => {
  try {
    console.log('Deleting post with ID:', id);
    const response = await client.graphql({
      query: mutations.deletePost,
      variables: { id },
      authMode: 'apiKey'
    });
    console.log('Delete post response:', response);
    return response.data.deletePost;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}; 