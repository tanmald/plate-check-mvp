import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { isTestUser, mockPlan } from "@/lib/test-data";

export interface MealTemplate {
  id: string;
  type: string;
  icon: string;
  name: string;
  requiredFoods: string[];
  allowedFoods: string[];
  calories: string;
  protein: string;
}

export interface NutritionPlan {
  name: string;
  uploadedAt: string;
  source: string;
  templates: MealTemplate[];
}

export function useNutritionPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["nutrition-plan", user?.id],
    queryFn: async () => {
      // Return mock data for test users
      if (isTestUser(user?.email)) {
        return { plan: mockPlan, hasPlan: true };
      }

      // Fetch real data from database
      if (!user?.id) return { plan: null, hasPlan: false };

      // Get the most recent nutrition plan
      const { data: planData, error: planError } = await supabase
        .from("nutrition_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (planError && planError.code !== "PGRST116") throw planError;
      if (!planData) return { plan: null, hasPlan: false };

      // Get meal templates for this plan
      const { data: templatesData, error: templatesError } = await supabase
        .from("meal_templates")
        .select(`
          id,
          meal_type,
          template_name,
          required_foods,
          allowed_foods,
          target_calories_min,
          target_calories_max,
          target_protein_min,
          target_protein_max
        `)
        .eq("plan_id", planData.id);

      if (templatesError) throw templatesError;

      // Transform to app format
      const templates: MealTemplate[] = (templatesData || []).map((t) => ({
        id: t.id,
        type: t.meal_type,
        icon: getMealIcon(t.meal_type),
        name: t.template_name,
        requiredFoods: t.required_foods || [],
        allowedFoods: t.allowed_foods || [],
        calories: `${t.target_calories_min || 0}-${t.target_calories_max || 0}`,
        protein: `${t.target_protein_min || 0}-${t.target_protein_max || 0}g`,
      }));

      const plan: NutritionPlan = {
        name: planData.plan_name,
        uploadedAt: new Date(planData.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        source: planData.plan_source || "Uploaded Plan",
        templates,
      };

      return { plan, hasPlan: true };
    },
    enabled: !!user,
  });
}

function getMealIcon(mealType: string): string {
  const icons: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };
  return icons[mealType] || "🍽️";
}

export function useCreateNutritionPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: { name: string; source: string; templates: MealTemplate[] }) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create the plan
      const { data: plan, error: planError } = await supabase
        .from("nutrition_plans")
        .insert({
          user_id: user.id,
          plan_name: planData.name,
          plan_source: planData.source,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create templates
      const templates = planData.templates.map((t) => ({
        plan_id: plan.id,
        meal_type: t.type,
        template_name: t.name,
        required_foods: t.requiredFoods,
        allowed_foods: t.allowedFoods,
        target_calories_min: parseInt(t.calories.split("-")[0]) || 0,
        target_calories_max: parseInt(t.calories.split("-")[1]) || 0,
        target_protein_min: parseInt(t.protein.split("-")[0]) || 0,
        target_protein_max: parseInt(t.protein.split("-")[1]) || 0,
      }));

      const { error: templatesError } = await supabase
        .from("meal_templates")
        .insert(templates);

      if (templatesError) throw templatesError;

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}
