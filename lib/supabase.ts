import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded fallbacks for local Gradle release builds (process.env is empty there)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://krujhlmoqevnwocqgcdd.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_5hxacMMC_cMbl753s5aA-w_FuiDx899';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
