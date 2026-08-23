import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oxvxoddgbdlypvkwjfmq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnhvZGRnYmRseXB2a3dqZm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzQ2MjksImV4cCI6MjEwMTY1MDYyOX0.qv_VNrZpXqJ3ISyjCiaU4Au973cOTgWqnoDOUzjGbic'

export const supabase = createClient(supabaseUrl, supabaseKey)
