-- 初始化資料表結構和行級安全策略

-- 啟用 RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.transactions enable row level security;

-- 創建交易資料表 (修改版，符合實際結構)
create table if not exists public.transactions (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category_id text not null,
  date date not null default current_date,
  description text,
  created_at timestamp with time zone default now() not null
);

-- 創建類別資料表 (根據實際結構可能也需要調整)
create table if not exists public.categories (
  id text not null primary key,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  user_id uuid references auth.users(id),
  is_system boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 創建個人資料表 (根據實際結構可能也需要調整)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  display_name text,
  avatar_url text,
  monthly_budget numeric default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 資料庫行級安全策略
create policy "使用者只能訪問自己的交易資料" 
  on public.transactions 
  for all 
  using (auth.uid() = user_id);

create policy "使用者只能訪問自己的個人資料" 
  on public.profiles 
  for all 
  using (auth.uid() = id);

create policy "使用者可以查看系統預設類別和自己創建的類別" 
  on public.categories 
  for select
  using (is_system = true or (user_id = auth.uid() and user_id is not null));

create policy "使用者只能修改自己創建的類別" 
  on public.categories 
  for all 
  using (user_id = auth.uid() and user_id is not null);

-- 刪除不需要的 updated_at 觸發器，因為 transactions 表沒有 updated_at 欄位
-- 為其他表創建 updated_at 觸發器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 不要為 transactions 表創建觸發器，因為它沒有 updated_at 欄位
create trigger set_updated_at
before update on public.profiles
for each row
execute function update_updated_at_column();

create trigger set_updated_at
before update on public.categories
for each row
execute function update_updated_at_column();

-- 為每個新用戶自動創建個人資料
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 插入預設類別資料
INSERT INTO public.categories (id, name, type, icon, is_system) VALUES
  ('food', '飲食', 'expense', '🍴', true),
  ('transport', '交通', 'expense', '🚗', true),
  ('shopping', '購物', 'expense', '🛍️', true),
  ('entertainment', '娛樂', 'expense', '🎮', true),
  ('health', '醫療', 'expense', '💊', true),
  ('housing', '住房', 'expense', '🏠', true),
  ('utility', '水電瓦斯', 'expense', '💡', true),
  ('communication', '通訊', 'expense', '📱', true),
  ('education', '教育', 'expense', '📚', true),
  ('insurance', '保險', 'expense', '🛡️', true),
  ('tax', '稅金', 'expense', '💸', true),
  ('parental', '孝親', 'expense', '👵', true),
  ('children', '小孩', 'expense', '🧒', true),
  ('pet', '寵物', 'expense', '🐶', true),
  ('travel', '旅遊', 'expense', '✈️', true),
  ('social', '交際', 'expense', '🤝', true),
  ('beauty', '美容', 'expense', '💅', true),
  ('sports', '運動', 'expense', '🏃', true),
  ('other', '其他', 'expense', '🔖', true),
  ('salary', '薪資', 'income', '💰', true),
  ('bonus', '獎金', 'income', '🎁', true),
  ('investment', '投資', 'income', '📈', true),
  ('interest', '利息', 'income', '🏦', true),
  ('refund', '退款', 'income', '↩️', true),
  ('other_income', '其他收入', 'income', '🪙', true)
ON CONFLICT (id) DO NOTHING;