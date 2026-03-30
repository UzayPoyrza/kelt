export type Plan = "free" | "personal" | "creator";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "canceling";
export type BillingCycle = "monthly" | "yearly";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  credits_remaining: number;
  credits_granted: number;
  preferences: {
    defaultVoice?: string;
    defaultDuration?: number;
    defaultSound?: string;
    autoDownload?: boolean;
    ambientPreview?: boolean;
  } | null;
  created_at: string;
  is_anonymous: boolean;
  updated_at: string;
  // Joined from subscriptions table by /api/user
  subscription_status?: SubscriptionStatus | null;
  subscription_period_end?: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  title: string | null;
  prompt: string | null;
  voice: string | null;
  duration: number | null;
  protocol: string | null;
  soundscape: string | null;
  sound_options: { recommended: string[]; other: string[] } | null;
  script: Record<string, unknown>[] | null;
  category: string | null;
  intent: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  session_id: string | null;
  user_id: string;
  prompt: string | null;
  voice: string | null;
  duration: string | null;
  status: GenerationStatus;
  audio_url: string | null;
  credit_cost: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Exclude<Plan, "free">;
  billing_cycle: BillingCycle;
  credits_per_month: number;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  generation_id: string | null;
  created_at: string;
}
