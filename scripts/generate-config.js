import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Generate configuration files for the application
 */
async function generateConfig() {
  console.log('Generating configuration files...');
  
  try {
    // Create a configuration object with environment variables
    const config = {
      // API Configuration
      api: {
        graphqlEndpoint: process.env.VITE_GRAPHQL_ENDPOINT,
        apiKey: process.env.VITE_GRAPHQL_API_KEY,
        region: process.env.AWS_REGION || 'us-east-2'
      },
      // Auth Configuration
      auth: {
        userPoolId: process.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: process.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
        identityPoolId: process.env.VITE_COGNITO_IDENTITY_POOL_ID
      },
      // Database Configuration
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: '********', // Don't include actual password in the config file
        name: process.env.DB_NAME
      }
    };
    
    // Create the config directory if it doesn't exist
    const configDir = path.join(process.cwd(), 'config');
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    
    // Write the configuration to a JSON file
    const configPath = path.join(configDir, 'app-config.json');
    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2),
      'utf8'
    );
    
    console.log(`Configuration file generated at ${configPath}`);
    
    return {
      success: true,
      message: 'Configuration files generated successfully'
    };
  } catch (error) {
    console.error('Error generating configuration files:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the generator if this file is executed directly
if (process.argv[1].includes('generate-config.js')) {
  generateConfig()
    .then(result => {
      if (result.success) {
        console.log('✅ Configuration files generated successfully!');
        process.exit(0);
      } else {
        console.error('❌ Configuration file generation failed!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during configuration generation:', err);
      process.exit(1);
    });
}

export default generateConfig; 