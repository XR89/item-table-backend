# Project Setup Instructions

### Step 1: Create SQLite Database
To set up the initial database, create a SQLite DB file in a `database` folder according to the path specified in `index.ts`. Execute the following SQL command to create the necessary table:

```sql
CREATE TABLE Items (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  price REAL
);
```
AutoIncrement can be  omitted as we are setting the ID on the server using UUID

### Step 2: Run Server

Compiled js file uploaded, simply run "node index.js" to start the server
