import { 
  AppSyncClient, 
  UpdateResolverCommand,
  GetResolverCommand,
  CreateResolverCommand
} from '@aws-sdk/client-appsync';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// AppSync configuration
const appSyncConfig = {
  apiId: process.env.APPSYNC_API_ID || 'x5ujbpctlnbsxahehbvnt3ie3y',
  region: process.env.AWS_REGION || 'us-east-2',
  dataSourceName: process.env.APPSYNC_DATASOURCE_NAME || 'ExpenseDB'
};

console.log('Using the following configuration:');
console.log(`API ID: ${appSyncConfig.apiId}`);
console.log(`Region: ${appSyncConfig.region}`);
console.log(`Data Source: ${appSyncConfig.dataSourceName}`);

// Create AppSync client
const appSyncClient = new AppSyncClient({
  region: appSyncConfig.region
});

// Resolver templates
const resolvers = {
  // Query resolvers
  'Query.getAllExpenses': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM expenses"]
}
`,
    responseTemplate: `
#if($context.result.data)
  $util.toJson($context.result.data)
#else
  []
#end
`
  },
  'Query.getExpensesByCategory': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM expenses WHERE category = :category"],
  "variableMap": {
    ":category": $util.toJson($ctx.args.category)
  }
}
`,
    responseTemplate: `
#if($context.result.data)
  $util.toJson($context.result.data)
#else
  []
#end
`
  },
  'Query.getExpensesByDateRange': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM expenses WHERE date BETWEEN :startDate AND :endDate"],
  "variableMap": {
    ":startDate": $util.toJson($ctx.args.startDate),
    ":endDate": $util.toJson($ctx.args.endDate)
  }
}
`,
    responseTemplate: `
#if($context.result.data)
  $util.toJson($context.result.data)
#else
  []
#end
`
  },
  'Query.getAllCategories': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM categories"]
}
`,
    responseTemplate: `
#if($context.result.data)
  $util.toJson($context.result.data)
#else
  []
#end
`
  },
  'Query.getBudgetsByMonth': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM budgets WHERE userId = :userId AND month = :month AND year = :year"],
  "variableMap": {
    ":userId": $util.toJson($ctx.args.userId),
    ":month": $util.toJson($ctx.args.month),
    ":year": $util.toJson($ctx.args.year)
  }
}
`,
    responseTemplate: `
#if($context.result.data)
  $util.toJson($context.result.data)
#else
  []
#end
`
  },
  'Query.getUser': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM users WHERE id = :id"],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id)
  }
}
`,
    responseTemplate: `
#if($context.result.data[0])
  $util.toJson($context.result.data[0])
#else
  null
#end
`
  },
  'Query.getUserByUsername': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM users WHERE username = :username"],
  "variableMap": {
    ":username": $util.toJson($ctx.args.username)
  }
}
`,
    responseTemplate: `
#if($context.result.data[0])
  $util.toJson($context.result.data[0])
#else
  null
#end
`
  },
  'Query.getAllUsers': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM users"]
}
`,
    responseTemplate: `
#if($context.result.data)
  $util.toJson($context.result.data)
#else
  []
#end
`
  },
  'Query.singlePost': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": ["SELECT * FROM posts WHERE id = :id"],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id)
  }
}
`,
    responseTemplate: `
#if($context.result.data[0])
  $util.toJson($context.result.data[0])
#else
  null
#end
`
  },
  
  // Mutation resolvers
  'Mutation.createExpense': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO expenses (id, name, amount, category, date, userId, createdAt, updatedAt) VALUES (:id, :name, :amount, :category, :date, :userId, NOW(), NOW())",
    "SELECT * FROM expenses WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($util.autoId()),
    ":name": $util.toJson($ctx.args.name),
    ":amount": $util.toJson($ctx.args.amount),
    ":category": $util.toJson($ctx.args.category),
    ":date": $util.toJson($ctx.args.date),
    ":userId": $util.toJson($ctx.args.userId)
  }
}
`,
    responseTemplate: `
#if($context.result.data[1][0])
  $util.toJson($context.result.data[1][0])
#else
  null
#end
`
  },
  'Mutation.updateExpense': {
    requestTemplate: `
#set($updateStatements = [])
#if($ctx.args.name)
  #set($discard = $updateStatements.add("name = :name"))
#end
#if($ctx.args.amount)
  #set($discard = $updateStatements.add("amount = :amount"))
#end
#if($ctx.args.category)
  #set($discard = $updateStatements.add("category = :category"))
#end
#if($ctx.args.date)
  #set($discard = $updateStatements.add("date = :date"))
#end
#set($discard = $updateStatements.add("updatedAt = NOW()"))

#set($updateStatement = "")
#foreach($statement in $updateStatements)
  #if($foreach.count == 1)
    #set($updateStatement = $statement)
  #else
    #set($updateStatement = "$updateStatement, $statement")
  #end
#end

{
  "version": "2018-05-29",
  "statements": [
    "UPDATE expenses SET $updateStatement WHERE id = :id",
    "SELECT * FROM expenses WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id)
    #if($ctx.args.name)
    , ":name": $util.toJson($ctx.args.name)
    #end
    #if($ctx.args.amount)
    , ":amount": $util.toJson($ctx.args.amount)
    #end
    #if($ctx.args.category)
    , ":category": $util.toJson($ctx.args.category)
    #end
    #if($ctx.args.date)
    , ":date": $util.toJson($ctx.args.date)
    #end
  }
}
`,
    responseTemplate: `
#if($context.result.data[1][0])
  $util.toJson($context.result.data[1][0])
#else
  null
#end
`
  },
  'Mutation.deleteExpense': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM expenses WHERE id = :id",
    "DELETE FROM expenses WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id)
  }
}
`,
    responseTemplate: `
#if($context.result.data[0][0])
  $util.toJson($context.result.data[0][0])
#else
  null
#end
`
  },
  'Mutation.createBudget': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO budgets (id, userId, categoryId, amount, month, year, createdAt, updatedAt) VALUES (:id, :userId, :categoryId, :amount, :month, :year, NOW(), NOW())",
    "SELECT * FROM budgets WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($util.autoId()),
    ":userId": $util.toJson($ctx.args.userId),
    ":categoryId": $util.toJson($ctx.args.categoryId),
    ":amount": $util.toJson($ctx.args.amount),
    ":month": $util.toJson($ctx.args.month),
    ":year": $util.toJson($ctx.args.year)
  }
}
`,
    responseTemplate: `
#if($context.result.data[1][0])
  $util.toJson($context.result.data[1][0])
#else
  null
#end
`
  },
  'Mutation.createUser': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO users (id, username, email, createdAt, updatedAt) VALUES (:id, :username, :email, NOW(), NOW())",
    "SELECT * FROM users WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id),
    ":username": $util.toJson($ctx.args.username),
    ":email": $util.toJson($ctx.args.email)
  }
}
`,
    responseTemplate: `
#if($context.result.data[1][0])
  $util.toJson($context.result.data[1][0])
#else
  null
#end
`
  },
  'Mutation.updateUser': {
    requestTemplate: `
#set($updateStatements = [])
#if($ctx.args.username)
  #set($discard = $updateStatements.add("username = :username"))
#end
#if($ctx.args.email)
  #set($discard = $updateStatements.add("email = :email"))
#end
#set($discard = $updateStatements.add("updatedAt = NOW()"))

#set($updateStatement = "")
#foreach($statement in $updateStatements)
  #if($foreach.count == 1)
    #set($updateStatement = $statement)
  #else
    #set($updateStatement = "$updateStatement, $statement")
  #end
#end

{
  "version": "2018-05-29",
  "statements": [
    "UPDATE users SET $updateStatement WHERE id = :id",
    "SELECT * FROM users WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id)
    #if($ctx.args.username)
    , ":username": $util.toJson($ctx.args.username)
    #end
    #if($ctx.args.email)
    , ":email": $util.toJson($ctx.args.email)
    #end
  }
}
`,
    responseTemplate: `
#if($context.result.data[1][0])
  $util.toJson($context.result.data[1][0])
#else
  null
#end
`
  },
  'Mutation.deleteUser': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM users WHERE id = :id",
    "DELETE FROM users WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id)
  }
}
`,
    responseTemplate: `
#if($context.result.data[0][0])
  $util.toJson($context.result.data[0][0])
#else
  null
#end
`
  },
  'Mutation.putPost': {
    requestTemplate: `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO posts (id, title, createdAt, updatedAt) VALUES (:id, :title, NOW(), NOW()) ON DUPLICATE KEY UPDATE title = :title, updatedAt = NOW()",
    "SELECT * FROM posts WHERE id = :id"
  ],
  "variableMap": {
    ":id": $util.toJson($ctx.args.id),
    ":title": $util.toJson($ctx.args.title)
  }
}
`,
    responseTemplate: `
#if($context.result.data[1][0])
  $util.toJson($context.result.data[1][0])
#else
  null
#end
`
  }
};

async function updateResolver(typeName, fieldName, templates) {
  try {
    const resolverKey = `${typeName}.${fieldName}`;
    console.log(`Updating resolver for ${resolverKey}...`);
    
    // Get the current resolver
    const getResolverParams = {
      apiId: appSyncConfig.apiId,
      typeName,
      fieldName
    };
    
    try {
      const resolverData = await appSyncClient.send(new GetResolverCommand(getResolverParams));
      console.log(`Resolver for ${resolverKey} found, updating...`);
      
      // Update the resolver
      const updateResolverParams = {
        apiId: appSyncConfig.apiId,
        typeName,
        fieldName,
        dataSourceName: appSyncConfig.dataSourceName,
        requestMappingTemplate: templates.requestTemplate,
        responseMappingTemplate: templates.responseTemplate
      };
      
      await appSyncClient.send(new UpdateResolverCommand(updateResolverParams));
      console.log(`✅ Resolver for ${resolverKey} updated successfully`);
    } catch (error) {
      if (error.name === 'NotFoundException') {
        console.log(`Resolver for ${resolverKey} not found, creating...`);
        
        // Create the resolver
        const createResolverParams = {
          apiId: appSyncConfig.apiId,
          typeName,
          fieldName,
          dataSourceName: appSyncConfig.dataSourceName,
          requestMappingTemplate: templates.requestTemplate,
          responseMappingTemplate: templates.responseTemplate
        };
        
        await appSyncClient.send(new CreateResolverCommand(createResolverParams));
        console.log(`✅ Resolver for ${resolverKey} created successfully`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Error updating resolver for ${typeName}.${fieldName}:`, error);
  }
}

async function updateAllResolvers() {
  try {
    console.log('Updating all resolvers...');
    
    for (const [key, templates] of Object.entries(resolvers)) {
      const [typeName, fieldName] = key.split('.');
      await updateResolver(typeName, fieldName, templates);
    }
    
    console.log('✅ All resolvers updated successfully');
  } catch (error) {
    console.error('❌ Error updating resolvers:', error);
  }
}

updateAllResolvers(); 