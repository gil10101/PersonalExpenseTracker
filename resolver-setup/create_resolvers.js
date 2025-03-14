const { AppSyncClient, CreateResolverCommand, UpdateResolverCommand, ListResolversCommand } = require('@aws-sdk/client-appsync');

// Configure the AWS SDK
const client = new AppSyncClient({ region: 'us-east-2' }); // Replace with your AWS region if different

// Your AppSync API ID - IMPORTANT: Replace this with your actual AppSync API ID
const apiId = 'x5ujbpctlnbsxahehbvnt3ie3y'; // Updated with the correct API ID

// Data source name - This should match the data source you've set up in your AppSync console
const dataSource = 'ExpenseDB';

// Helper function to create or update a resolver
async function createOrUpdateResolver(typeName, fieldName, requestTemplate, responseTemplate) {
  try {
    // Check if resolver already exists
    const listParams = {
      apiId,
      typeName
    };
    
    const existingResolvers = await client.send(new ListResolversCommand(listParams));
    const existingResolver = existingResolvers.resolvers.find(r => r.fieldName === fieldName);
    
    const resolverParams = {
      apiId,
      typeName,
      fieldName,
      dataSourceName: dataSource,
      requestMappingTemplate: requestTemplate,
      responseMappingTemplate: responseTemplate
    };
    
    if (existingResolver) {
      // Update existing resolver
      console.log(`Updating resolver for ${typeName}.${fieldName}`);
      await client.send(new UpdateResolverCommand(resolverParams));
    } else {
      // Create new resolver
      console.log(`Creating resolver for ${typeName}.${fieldName}`);
      await client.send(new CreateResolverCommand(resolverParams));
    }
    
    console.log(`Successfully configured resolver for ${typeName}.${fieldName}`);
  } catch (error) {
    console.error(`Error configuring resolver for ${typeName}.${fieldName}:`, error);
  }
}

// Define SQL templates for each resolver type
const getExpenseTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM expenses WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id)
  }
}
`;

const listExpensesTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    #if($ctx.args.nextToken)
      "SELECT * FROM expenses LIMIT 20 OFFSET :OFFSET"
    #else
      "SELECT * FROM expenses LIMIT :LIMIT"
    #end
  ],
  "variableMap": {
    #if($ctx.args.nextToken)
      ":OFFSET": $util.toJson($util.parseInt($ctx.args.nextToken))
    #end
    #if($ctx.args.limit)
      ":LIMIT": $util.toJson($ctx.args.limit)
    #else
      ":LIMIT": $util.toJson(20)
    #end
  }
}
`;

const getExpensesByCategoryTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM expenses WHERE category = :CATEGORY"
  ],
  "variableMap": {
    ":CATEGORY": $util.toJson($ctx.args.category)
  }
}
`;

const getExpensesByDateRangeTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM expenses WHERE date BETWEEN :START_DATE AND :END_DATE"
  ],
  "variableMap": {
    ":START_DATE": $util.toJson($ctx.args.startDate),
    ":END_DATE": $util.toJson($ctx.args.endDate)
  }
}
`;

const getAllExpensesTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    #if($ctx.args.userId)
      "SELECT * FROM expenses WHERE userId = :USER_ID"
    #else
      "SELECT * FROM expenses"
    #end
  ]
  #if($ctx.args.userId)
  ,
  "variableMap": {
    ":USER_ID": $util.toJson($ctx.args.userId)
  }
  #end
}
`;

const getAllCategoriesTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM categories"
  ]
}
`;

const getBudgetsByMonthTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM budgets WHERE userId = :USER_ID AND month = :MONTH AND year = :YEAR"
  ],
  "variableMap": {
    ":USER_ID": $util.toJson($ctx.args.userId),
    ":MONTH": $util.toJson($ctx.args.month),
    ":YEAR": $util.toJson($ctx.args.year)
  }
}
`;

const getPostTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM posts WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id)
  }
}
`;

const listPostsTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    #if($ctx.args.nextToken)
      "SELECT * FROM posts LIMIT 20 OFFSET :OFFSET"
    #else
      "SELECT * FROM posts LIMIT :LIMIT"
    #end
  ],
  "variableMap": {
    #if($ctx.args.nextToken)
      ":OFFSET": $util.toJson($util.parseInt($ctx.args.nextToken))
    #end
    #if($ctx.args.limit)
      ":LIMIT": $util.toJson($ctx.args.limit)
    #else
      ":LIMIT": $util.toJson(20)
    #end
  }
}
`;

const createExpenseTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO expenses(id, name, amount, category, date, userId, createdAt, updatedAt) VALUES(:ID, :NAME, :AMOUNT, :CATEGORY, :DATE, :USER_ID, :CREATED_AT, :UPDATED_AT)",
    "SELECT * FROM expenses WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($util.autoId()),
    ":NAME": $util.toJson($ctx.args.name),
    ":AMOUNT": $util.toJson($ctx.args.amount),
    ":CATEGORY": $util.toJson($ctx.args.category),
    ":DATE": $util.toJson($ctx.args.date),
    ":USER_ID": $util.toJson($ctx.args.userId),
    ":CREATED_AT": $util.toJson($util.time.nowISO8601()),
    ":UPDATED_AT": $util.toJson($util.time.nowISO8601())
  }
}
`;

const updateExpenseTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "UPDATE expenses SET name = :NAME, amount = :AMOUNT, category = :CATEGORY, date = :DATE, userId = :USER_ID, updatedAt = :UPDATED_AT WHERE id = :ID",
    "SELECT * FROM expenses WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id),
    ":NAME": $util.toJson($ctx.args.name),
    ":AMOUNT": $util.toJson($ctx.args.amount),
    ":CATEGORY": $util.toJson($ctx.args.category),
    ":DATE": $util.toJson($ctx.args.date),
    ":USER_ID": $util.toJson($ctx.args.userId),
    ":UPDATED_AT": $util.toJson($util.time.nowISO8601())
  }
}
`;

const deleteExpenseTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM expenses WHERE id = :ID",
    "DELETE FROM expenses WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id)
  }
}
`;

const createBudgetTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO budgets(id, userId, categoryId, amount, month, year, createdAt, updatedAt) VALUES(:ID, :USER_ID, :CATEGORY_ID, :AMOUNT, :MONTH, :YEAR, :CREATED_AT, :UPDATED_AT)",
    "SELECT * FROM budgets WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($util.autoId()),
    ":USER_ID": $util.toJson($ctx.args.userId),
    ":CATEGORY_ID": $util.toJson($ctx.args.categoryId),
    ":AMOUNT": $util.toJson($ctx.args.amount),
    ":MONTH": $util.toJson($ctx.args.month),
    ":YEAR": $util.toJson($ctx.args.year),
    ":CREATED_AT": $util.toJson($util.time.nowISO8601()),
    ":UPDATED_AT": $util.toJson($util.time.nowISO8601())
  }
}
`;

const createPostTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO posts(id, title, createdAt, updatedAt) VALUES(:ID, :TITLE, :CREATED_AT, :UPDATED_AT)",
    "SELECT * FROM posts WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($util.autoId()),
    ":TITLE": $util.toJson($ctx.args.title),
    ":CREATED_AT": $util.toJson($util.time.nowISO8601()),
    ":UPDATED_AT": $util.toJson($util.time.nowISO8601())
  }
}
`;

const updatePostTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "UPDATE posts SET title = :TITLE, updatedAt = :UPDATED_AT WHERE id = :ID",
    "SELECT * FROM posts WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id),
    ":TITLE": $util.toJson($ctx.args.title),
    ":UPDATED_AT": $util.toJson($util.time.nowISO8601())
  }
}
`;

const deletePostTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM posts WHERE id = :ID",
    "DELETE FROM posts WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id)
  }
}
`;

const standardResponseTemplate = `
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end

#if($ctx.result.length > 0)
  #if($ctx.result[0].length > 0)
    $util.toJson($ctx.result[0][0])
  #else
    null
  #end
#else
  null
#end
`;

const listResponseTemplate = `
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end

## Check the structure of the result and handle it appropriately
#if($ctx.result.size() == 0)
  #set($items = [])
#elseif($ctx.result.getClass().isArray())
  #set($items = $ctx.result)
#elseif($ctx.result.size() > 0)
  #set($items = $ctx.result)
#else
  #set($items = [])
#end

#set($nextOffset = 0)
#if($items.size() > 0)
  #set($nextOffset = $ctx.args.nextToken)
  #if(!$nextOffset)
    #set($nextOffset = 0)
  #end
  #set($nextOffset = $nextOffset + $items.size())
#end

{
  "items": $util.toJson($items),
  "nextToken": #if($items.size() == $ctx.args.limit || ($items.size() == 20 && !$ctx.args.limit)) $util.toJson("$nextOffset") #else null #end
}
`;

// Connection type templates
const connectionItemsTemplate = `
#if($ctx.source.items)
  $util.toJson($ctx.source.items)
#else
  []
#end
`;

const connectionNextTokenTemplate = `
#if($ctx.source.nextToken)
  $util.toJson($ctx.source.nextToken)
#else
  null
#end
`;

// Field resolvers templates
const postCreatedAtTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT createdAt FROM posts WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.source.id)
  }
}
`;

const postUpdatedAtTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT updatedAt FROM posts WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.source.id)
  }
}
`;

const getAllExpensesResponseTemplate = `
#if($ctx.error)
  $util.error($ctx.error.message, $ctx.error.type)
#end

## For getAllExpenses, we need to ensure we're returning a list directly
## The MySQL data source returns results in $ctx.result

#if($ctx.result && $ctx.result.size() > 0)
  #if($ctx.result[0] && $ctx.result[0].getClass().isArray())
    $util.toJson($ctx.result[0])
  #else
    $util.toJson($ctx.result)
  #end
#else
  []
#end
`;

// User operation templates
const getUserTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM users WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id)
  }
}
`;

const getUserByUsernameTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM users WHERE username = :USERNAME"
  ],
  "variableMap": {
    ":USERNAME": $util.toJson($ctx.args.username)
  }
}
`;

const getAllUsersTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM users"
  ]
}
`;

const createUserTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "INSERT INTO users(id, username, email, createdAt, updatedAt) VALUES(:ID, :USERNAME, :EMAIL, :CREATED_AT, :UPDATED_AT)",
    "SELECT * FROM users WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id),
    ":USERNAME": $util.toJson($ctx.args.username),
    ":EMAIL": $util.toJson($ctx.args.email),
    ":CREATED_AT": $util.toJson($util.time.nowISO8601()),
    ":UPDATED_AT": $util.toJson($util.time.nowISO8601())
  }
}
`;

const updateUserTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "UPDATE users SET username = :USERNAME, email = :EMAIL, updatedAt = :UPDATED_AT WHERE id = :ID",
    "SELECT * FROM users WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id),
    ":USERNAME": $util.toJson($ctx.args.username),
    ":EMAIL": $util.toJson($ctx.args.email),
    ":UPDATED_AT": $util.toJson($util.time.nowISO8601())
  }
}
`;

const deleteUserTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM users WHERE id = :ID",
    "DELETE FROM users WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id)
  }
}
`;

const singlePostTemplate = `
{
  "version": "2018-05-29",
  "statements": [
    "SELECT * FROM posts WHERE id = :ID"
  ],
  "variableMap": {
    ":ID": $util.toJson($ctx.args.id)
  }
}
`;

// Main function to create all resolvers
async function createAllResolvers() {
  try {
    console.log('Starting resolver creation/update process...');
    
    // Query resolvers - only include those that exist in the schema
    await createOrUpdateResolver('Query', 'getExpensesByCategory', getExpensesByCategoryTemplate, listResponseTemplate);
    await createOrUpdateResolver('Query', 'getExpensesByDateRange', getExpensesByDateRangeTemplate, listResponseTemplate);
    await createOrUpdateResolver('Query', 'getAllExpenses', getAllExpensesTemplate, getAllExpensesResponseTemplate);
    await createOrUpdateResolver('Query', 'getAllCategories', getAllCategoriesTemplate, listResponseTemplate);
    await createOrUpdateResolver('Query', 'getBudgetsByMonth', getBudgetsByMonthTemplate, listResponseTemplate);
    await createOrUpdateResolver('Query', 'singlePost', singlePostTemplate, standardResponseTemplate);
    
    // User query resolvers
    await createOrUpdateResolver('Query', 'getUser', getUserTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Query', 'getUserByUsername', getUserByUsernameTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Query', 'getAllUsers', getAllUsersTemplate, listResponseTemplate);
    
    // Mutation resolvers - only include those that exist in the schema
    await createOrUpdateResolver('Mutation', 'createExpense', createExpenseTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Mutation', 'updateExpense', updateExpenseTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Mutation', 'deleteExpense', deleteExpenseTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Mutation', 'createBudget', createBudgetTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Mutation', 'putPost', createPostTemplate, standardResponseTemplate);
    
    // User mutation resolvers
    await createOrUpdateResolver('Mutation', 'createUser', createUserTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Mutation', 'updateUser', updateUserTemplate, standardResponseTemplate);
    await createOrUpdateResolver('Mutation', 'deleteUser', deleteUserTemplate, standardResponseTemplate);
    
    console.log('Resolver creation/update process completed successfully!');
  } catch (error) {
    console.error('Error in resolver creation/update process:', error);
  }
}

// Run the script
createAllResolvers();