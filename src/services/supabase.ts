import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize database schema if needed
const initializeDatabase = async () => {
  try {
    // Check if tables exist
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (error) {
      console.error('Error checking tables:', error)
      return
    }

    const existingTables = data.map((t: any) => t.table_name)

    // Create profiles table if it doesn't exist
    if (!existingTables.includes('profiles')) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: 'init',
            created_at: new Date().toISOString(),
          },
        ])

      if (profileError) {
        console.error('Error initializing profiles table:', profileError)
      }
    }

    // Create posts table if it doesn't exist
    if (!existingTables.includes('posts')) {
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            id: 'init',
            created_at: new Date().toISOString(),
          },
        ])

      if (postError) {
        console.error('Error initializing posts table:', postError)
      }
    }

    // Create ratings table if it doesn't exist
    if (!existingTables.includes('ratings')) {
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert([
          {
            id: 'init',
            created_at: new Date().toISOString(),
          },
        ])

      if (ratingError) {
        console.error('Error initializing ratings table:', ratingError)
      }
    }

    // Create comments table if it doesn't exist
    if (!existingTables.includes('comments')) {
      const { error: commentError } = await supabase
        .from('comments')
        .insert([
          {
            id: 'init',
            created_at: new Date().toISOString(),
          },
        ])

      if (commentError) {
        console.error('Error initializing comments table:', commentError)
      }
    }

    // Create reports table if it doesn't exist
    if (!existingTables.includes('reports')) {
      const { error: reportError } = await supabase
        .from('reports')
        .insert([
          {
            id: 'init',
            created_at: new Date().toISOString(),
          },
        ])

      if (reportError) {
        console.error('Error initializing reports table:', reportError)
      }
    }
  } catch (err) {
    console.error('Database initialization error:', err)
  }
}

// Initialize database on startup
if (import.meta.env.MODE !== 'test') {
  initializeDatabase()
}

export { supabase }
export default supabase
