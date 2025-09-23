-- Step 1: Create the new user_roles table
-- ================================
-- User Roles Table
-- ================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin','employee','vendor','customer')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ================================
-- Indexes
-- ================================
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles(role);

-- ================================
-- Policies
-- ================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admin can manage all user_roles
CREATE POLICY "Admin can manage all user_roles"
ON public.user_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur2
        WHERE ur2.user_id = auth.uid() AND ur2.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur2
        WHERE ur2.user_id = auth.uid() AND ur2.role = 'admin'
    )
);

-- ================================
-- Grants
-- ================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- ================================
-- Triggers
-- ================================

CREATE TRIGGER update_user_roles_updated_at 
BEFORE UPDATE ON public.user_roles 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
