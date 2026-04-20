# Circle

## Database Setup

This project uses Supabase with Drizzle ORM for database management.

### Initial Setup

1. **Run Drizzle Migrations**

   ```bash
   npx drizzle-kit push
   ```

2. **Set up Supabase Auth Trigger (Manual Setup Required)**

   After running the migrations, you need to manually set up a database trigger in the Supabase dashboard to automatically create user records when someone signs up.

   **Steps:**
   1. Go to your Supabase Dashboard
   2. Navigate to Database → Functions
   3. Create a new function named `handle_new_user` with this code:

   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.users (id, email, created_at)
     VALUES (NEW.id, NEW.email, NOW());
     RETURN NEW;
   EXCEPTION
     WHEN unique_violation THEN
       -- User already exists, just return NEW
       RETURN NEW;
     WHEN OTHERS THEN
       -- Log the error and still return NEW to not break auth
       RAISE LOG 'Error in handle_new_user: %', SQLERRM;
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

   4. Navigate to Database → Triggers
   5. Create a new trigger:
      - **Name**: `on_auth_user_created`
      - **Table**: `auth.users`
      - **Events**: `INSERT`
      - **Type**: `AFTER`
      - **Orientation**: `ROW`
      - **Function**: `handle_new_user`

   6. Set up Row Level Security policies:

   ```sql
   -- Enable RLS
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

   -- Allow service role to insert (for the trigger)
   CREATE POLICY "Enable insert for service role" ON public.users
     FOR INSERT WITH CHECK (true);

   -- Allow users to read their own data
   CREATE POLICY "Users can view own profile" ON public.users
     FOR SELECT USING (auth.uid() = id);

   -- Allow users to update their own data
   CREATE POLICY "Users can update own profile" ON public.users
     FOR UPDATE USING (auth.uid() = id);
   ```

   **Why this is needed:** When users sign up via OAuth (Google), Supabase creates a record in `auth.users` but we need a corresponding record in our `public.users` table for our application logic.

### Environment Variables

Make sure to set up your `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

## About

This is a ChatGPT like app and aims to provide a better user experience among another exclusive features. Also it challenge to connect with different open and closed AI models, from OpenAI or Anthropic, to models running locally like Ollama.

## Planned features

Working on it.

![299shots_so](https://github.com/fcxmarquez/enki-ai/assets/63473082/ab4cde1d-09e4-4873-9054-aa0284771dc6)
