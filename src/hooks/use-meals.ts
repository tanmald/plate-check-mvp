import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockMeals } from "@/lib/test-data";

export interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  time: string;
  score: number;
  imageUrl?: string;
  foods: string[];
  feedback?: string;
}

export function useMeals(date?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["meals", user?.id, date],
    queryFn: async () => {
      // Return mock data for test users
      if (isTestUser(user?.email)) {
        return mockMeals;
      }

      // Fetch real data from database
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("meal_logs")
        .select(`
          id,
          meal_type,
          meal_name,
          logged_at,
          adherence_score,
          photo_url,
          detected_foods,
          ai_feedback
        `)
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false });

      if (error) throw error;

      // Transform database format to app format
      return (data || []).map((meal) => ({
        id: meal.id,
        type: meal.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
        name: meal.meal_name || "Meal",
        time: new Date(meal.logged_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        score: meal.adherence_score || 0,
        imageUrl: meal.photo_url || undefined,
        foods: meal.detected_foods || [],
        feedback: meal.ai_feedback || undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useTodayMeals() {
  const today = new Date().toISOString().split("T")[0];
  return useMeals(today);
}
