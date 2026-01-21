import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteUserByEmail(email: string) {
  try {
    console.log(`Searching for user with email: ${email}...`);
    
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError.message);
      return;
    }

    const user = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }

    console.log(`Found user: ${user.id} (${user.email})`);
    console.log(`Created at: ${user.created_at}`);
    console.log(`Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError.message);
      return;
    }

    console.log(`Successfully deleted user: ${email} (${user.id})`);
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
  }
}

async function deleteUserById(userId: string) {
  try {
    console.log(`Deleting user with ID: ${userId}...`);
    
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Error deleting user:', error.message);
      return;
    }

    console.log(`Successfully deleted user: ${userId}`);
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
  }
}

async function listUsers() {
  try {
    console.log('Fetching all users...\n');
    
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error.message);
      return;
    }

    if (data.users.length === 0) {
      console.log('No users found.');
      return;
    }

    console.log(`Found ${data.users.length} user(s):\n`);
    data.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'No email'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Email Verified: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
  }
}

const args = process.argv.slice(2);
const command = args[0];
const value = args[1];

if (command === 'delete-email' && value) {
  deleteUserByEmail(value).then(() => process.exit(0));
} else if (command === 'delete-id' && value) {
  deleteUserById(value).then(() => process.exit(0));
} else if (command === 'list') {
  listUsers().then(() => process.exit(0));
} else {
  console.log('Usage:');
  console.log('  npm run delete-user list                    - List all users');
  console.log('  npm run delete-user delete-email <email>    - Delete user by email');
  console.log('  npm run delete-user delete-id <userId>      - Delete user by ID');
  console.log('');
  console.log('Example:');
  console.log('  npm run delete-user delete-email aprameyakannan@gmail.com');
  process.exit(1);
}
